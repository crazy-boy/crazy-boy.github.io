---
title: Git Hooks 完全指南：从入门到团队协作
tags: [Git,Hooks]
categories: [Git]
abbrlink: 'git-hooks-guide'
date: 2026-04-23 15:05:14
updated: 2026-04-23 15:05:14
---

在版本控制的工作流中，Git Hooks 是一项强大却常被忽视的功能。它允许你在 Git 命令执行的关键节点上插入自定义脚本，从而自动执行代码检查、格式校验、消息规范等任务。本文将带你全面了解 Git Hooks 的原理、用法，以及如何在实际项目中优雅地管理和分享钩子。

---

## 一、什么是 Git Hooks？

Git Hooks 是 Git 内置的**钩子脚本机制**。每当特定事件（如 `commit`、`push`、`rebase`）发生时，Git 会自动查找 `.git/hooks/` 目录下对应的脚本文件并执行。如果脚本以非零状态退出（`exit 1`），Git 将中止当前操作，从而实现“在错误发生前拦截”的效果。

这些钩子可以分为两大类：
- **客户端钩子**：在本地操作（commit、push、rebase）时触发。
- **服务端钩子**：在服务器接收推送（pre-receive、update、post-receive）时触发，常用于 CI/CD 权限校验。

---

## 二、钩子的存放与构成

每个 Git 仓库都有一个隐藏的钩子目录：
```bash
cd your-project
ls -la .git/hooks/
```

初始状态下，你会看到一堆以 `.sample` 结尾的示例脚本（如 `pre-commit.sample`）。这些示例是用 Shell 脚本写的，但你也可以使用 Python、Ruby、Node.js 等任何你熟悉的语言——只要脚本具有可执行权限（`chmod +x`）且以适当的 shebang 开头。

> ⚠️ 注意：`.git/hooks/` 目录不会被版本控制，因此团队其他成员不会自动获得你的钩子。这是下文将要讨论的痛点之一。

---

## 三、常用钩子速查表

| 钩子名称         | 触发时机                   | 典型用途                                                   |
|----------------|---------------------------|------------------------------------------------------------|
| `pre-commit`   | `git commit` 执行之前       | 运行代码检查（lint）、单元测试、删除调试语句、自动格式化        |
| `prepare-commit-msg` | 启动提交信息编辑器之前 | 自动填充提交信息模板，添加修改文件列表等                       |
| `commit-msg`   | 用户输入提交信息之后         | 校验提交信息的格式（如约定式提交 Conventional Commits）       |
| `post-commit`  | `git commit` 完成之后       | 发送通知、更新文档、触发后续构建                              |
| `pre-rebase`   | `git rebase` 执行之前       | 禁止对已推送的分支进行 rebase                                |
| `pre-push`     | `git push` 执行之前         | 运行集成测试、检查是否遗漏提交                               |
| `post-checkout`| `git checkout` / `switch` 后 | 自动安装依赖、刷新环境变量                                  |

---

## 四、快速上手：编写第一个钩子

以 `pre-commit` 为例，我们编写一个简单的检查脚本，防止代码中残留 `console.log`。

### 步骤 1：创建钩子文件
```bash
touch .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### 步骤 2：编写脚本内容
```bash
#!/bin/bash
echo "🔍 检查代码中是否含有 console.log..."

# 获取所有待提交的文件（cached 状态）
files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|ts|vue)$')

if [ -z "$files" ]; then
    echo "✅ 没有需要检查的 JS/TS 文件"
    exit 0
fi

# 逐文件检查
has_console=0
for file in $files; do
    if grep -n "console.log" "$file" 2>/dev/null; then
        echo "❌ $file 中发现 console.log"
        has_console=1
    fi
done

if [ $has_console -eq 1 ]; then
    echo "⚠️  请移除所有 console.log 后再提交"
    exit 1
fi

echo "✅ 预提交检查通过"
exit 0
```

现在，任何包含 `console.log` 的提交都会被拦下。如果你想强制提交（例如临时调试），可以使用 `git commit --no-verify` 跳过所有钩子。

---

## 五、进阶：commit-msg 钩子与提交信息规范

约定式提交（Conventional Commits）让提交历史更加清晰，也便于自动生成 changelog。我们可以用 `commit-msg` 钩子来强制实施规范。

### 钩子示例
```bash
#!/bin/bash
# .git/hooks/commit-msg

commit_msg=$(cat "$1")
pattern="^(feat|fix|docs|style|refactor|perf|test|chore|ci|build)(\(.+\))?: .{1,72}"

if ! echo "$commit_msg" | grep -qE "$pattern"; then
    echo "❌ 提交信息格式不符合约定！"
    echo "✅ 正确格式：<type>(<scope>): <subject>"
    echo "✅ 示例：feat(auth): 添加双因素认证"
    echo "✅ 可选 type：feat|fix|docs|style|refactor|perf|test|chore|ci|build"
    exit 1
fi

echo "✓ 提交信息格式通过"
```

将这个钩子共享给团队后，每个人都需要遵循统一的提交规范。

---

## 六、团队协作的痛点与解决方案

由于 `.git/hooks` 不被 Git 追踪，所以每个开发人员需要**手动复制钩子**到本地仓库。为此，社区发展出了几种优雅的管理方式：

### 6.1 使用 `init.templatedir` 创建全局钩子模板
你可以设置一个全局模板目录，其中包含钩子，之后每次 `git init` 或 `git clone` 时都会自动复制这些钩子。
```bash
mkdir -p ~/.git-templates/hooks
git config --global init.templatedir ~/.git-templates
# 将通用钩子（如 commit-msg）放入 ~/.git-templates/hooks/
chmod +x ~/.git-templates/hooks/*
```

缺点：无法针对不同项目使用不同钩子，更新也比较麻烦。

### 6.2 将钩子存放在项目仓库中，并通过脚本链接
将钩子脚本保存在项目根目录的 `.githooks/` 文件夹中，然后提供一个安装脚本，让每个开发者执行一次：
```bash
# bin/setup-githooks.sh
#!/bin/bash
ln -sf ../../.githooks/pre-commit .git/hooks/pre-commit
ln -sf ../../.githooks/commit-msg .git/hooks/commit-msg
chmod +x .git/hooks/*
```
缺点：每次新成员加入都需要手动运行安装脚本。

### 6.3 使用 `core.hooksPath` 指定钩子目录（Git 2.9+）
从 Git 2.9 开始，你可以通过配置将钩子目录指向项目内的某个文件夹：
```bash
git config core.hooksPath .githooks
```
然后把所有钩子脚本放在 `.githooks/` 下（注意要可执行）。这个配置可以被提交到 `.gitconfig` 或通过 `git config` 推送到本地仓库？实际上，`core.hooksPath` 是本地配置，不会自动传播。不过你可以在项目的 README 中要求每个开发者执行一次：
```bash
git config core.hooksPath .githooks
```
或者利用 `git config --local include.path` 引入一个模板配置。

### 6.4 使用脚手架工具（推荐）—— Husky + lint-staged

对于前端/Node.js 项目，**[Husky](https://typicode.github.io/husky/)** 是目前最流行的方案。它利用 `core.hooksPath` 特性，将钩子代码存放在项目根目录的 `.husky/` 文件夹中，并通过 `prepare` 脚本自动配置。

安装与使用：
```bash
npm install husky --save-dev
npx husky init   # 自动创建 .husky/ 目录，并在 package.json 中添加 prepare 脚本
```

添加钩子：
```bash
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

配合 `lint-staged`，可以实现只对暂存区文件进行检查，大大提高效率：
```json
{
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"]
  }
}
```

所有团队成员在 `npm install` 时会自动运行 `prepare` 脚本，从而安装一致的钩子。

---

## 七、实战案例：完整的工作流

假设我们要为一个 Vue 项目建立以下质量保障体系：
1. **pre-commit**：运行 ESLint + Prettier 自动格式化，禁止提交包含 `console.log` 的文件。
2. **commit-msg**：强制约定式提交格式。
3. **pre-push**：在推送前运行单元测试，如果失败则阻止推送。

### 步骤 1：安装依赖
```bash
npm install husky lint-staged @commitlint/cli @commitlint/config-conventional --save-dev
```

### 步骤 2：创建 commitlint 配置
```js
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional']
};
```

### 步骤 3：配置 lint-staged
```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write", "git add"]
  }
}
```

### 步骤 4：添加钩子
```bash
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
npx husky add .husky/pre-push "npm test"
```

### 步骤 5：提交到仓库
现在，团队中任何人克隆项目并执行 `npm install`，Husky 会自动配置好所有钩子。从此以后，每次提交都会自动检查代码风格、验证提交信息；每次推送前都会跑单元测试。

---

## 八、调试与故障排除

**钩子不执行？**
- 检查文件是否可执行：`chmod +x .husky/pre-commit`
- 检查 `core.hooksPath` 是否正确：`git config core.hooksPath`
- 尝试手动运行脚本看是否报错：`./.husky/pre-commit`

**跳过钩子临时提交**
```bash
git commit --no-verify -m "紧急修复"
# 或跳过某个特定钩子
git commit -n -m "allow skip hooks"
```

**查看 Git 实际使用的钩子路径**
```bash
git config --get core.hooksPath   # 如果输出配置的路径，则使用该路径下的钩子
# 否则默认是 .git/hooks
```

---

## 九、最佳实践总结

1. **保持钩子轻量**：`pre-commit` 应该只做快速的格式检查和静态分析，不要运行耗时的集成测试（这类测试应放在 `pre-push` 或 CI 中）。
2. **通过工具标准化**：使用 Husky + commitlint + lint-staged，让钩子随项目代码版本控制，降低团队协作成本。
3. **提供友好的错误信息**：当钩子拦截时，明确告知开发者如何修复（例如列出允许的 type 列表、给出正确示例）。
4. **不要完全依赖钩子**：钩子可以被 `--no-verify` 跳过，因此 CI 服务器上的检查仍然是必要的最后防线。
5. **版本控制钩子脚本**：如果使用自定义 shell 脚本，请将脚本放在项目内（如 `scripts/githooks/`），并通过 `core.hooksPath` 或配置脚本安装。

---

## 十、结语

Git Hooks 就像软件开发流程中的“守门人”，能够在代码进入仓库之前捕捉大量常见错误，并强制执行团队规范。虽然原生钩子的共享稍显不便，但借助 Husky 等现代工具，我们可以轻松地将规范以自动化、可复现的方式融入开发流程。

从今天开始，尝试为你的项目添加一个 `pre-commit` 钩子吧——只有几行脚本，却能省去无数次的代码审查口水战。自动化让开发更高效，也让团队协作更优雅。