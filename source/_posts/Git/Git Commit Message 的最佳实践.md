---
title: Git Commit Message 的最佳实践
tags: [Git,Commit]
categories: [Git]
abbrlink: 'git-commit-message-best-practices'
date: 2025-05-23 15:05:14
updated: 2025-05-23 15:05:14
---

在 Git 中，一个好的 commit message 应该清晰、简洁，并能准确描述本次提交的内容。良好的 commit 规范有助于团队协作、代码审查（Code Review）以及后续的版本维护。以下是 Git Commit Message 的最佳实践：

---

**1. Commit Message 结构**
推荐采用 Conventional Commits 规范，格式如下：
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```
**示例**
```
feat(auth): add user login API

- Implement JWT-based authentication
- Add login endpoint `/api/auth/login`
- Update README with API docs

fix: resolve memory leak in image processing

The previous implementation caused OOM errors when processing large images.
This fix uses a streaming approach to reduce memory usage.

BREAKING CHANGE: The `processImage` function now requires a callback.
```

---

**2. Commit Message 各部分说明**

| 部分 | 说明 | 示例 |
|------|------|------|
| type | 提交的类型，通常使用以下几种：<br> - `feat` (新功能)<br> - `fix` (Bug 修复)<br> - `docs` (文档更新)<br> - `style` (代码格式化，不影响逻辑)<br> - `refactor` (代码重构，既不是新功能也不是 Bug 修复)<br> - `test` (测试相关)<br> - `chore` (构建过程或辅助工具的变动)<br> - `perf` (性能优化)<br> - `revert` (回滚之前的提交) | `feat: add user login` |
| scope *(可选)* | 影响的范围（可选），如模块名、文件名等 | `(auth)` `(api)` |
| description | 简短描述本次提交的内容（现在时态，首字母小写） | `add user login API` |
| body *(可选)* | 详细说明变更内容（可多行） | `- 改进点1<br>- 改进点2` |
| footer *(可选)* | 重大变更、Breaking Changes 或关联的 Issue | `BREAKING CHANGE: ...` 或 `Closes #123` |

---

**3. 常见 Commit Type 示例**

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新增功能 | `feat: add dark mode` |
| `fix` | Bug 修复 | `fix: correct login validation` |
| `docs` | 文档更新 | `docs: update README.md` |
| `style` | 代码格式化（不影响逻辑） | `style: format code with Prettier` |
| `refactor` | 代码重构（非新功能/非 Bug 修复） | `refactor: optimize database queries` |
| `test` | 测试相关 | `test: add unit tests for utils` |
| `chore` | 构建/工具变更 | `chore: update dependencies` |
| `perf` | 性能优化 | `perf: improve rendering speed` |
| `revert` | 回滚提交 | `revert: revert "feat: add user login"` |

---

**4. 不好的 Commit Message 示例**
❌ 模糊不清
```
update code
fix bug
```
✅ 改进后
```
fix(auth): correct login validation error
feat(api): add user registration endpoint
```

❌ 缺少类型
```
add new feature
```
✅ 改进后
```
feat: implement user profile page
```

❌ 过于冗长
```
this commit adds a new feature that allows users to log in and also fixes some minor bugs in the process
```
✅ 改进后
```
feat: add user login API  
fix: resolve minor UI alignment issues
```

---

**5. 如何规范 Commit Message？**
**(1) 使用 Git Hooks（推荐）**
• Husky + commitlint（强制检查 Commit 格式）

  ```bash
  npm install husky --save-dev
  npx husky-init && npm install
  npm install @commitlint/{config-conventional,cli} --save-dev
  echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
  npx husky add .husky/commit-msg "npx --no-install commitlint --edit $1"
  ```
这样提交时如果不符合规范会被阻止。

**(2) 使用 Commitizen（交互式提交）**
```bash
npm install -g commitizen
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc
```
然后使用 `git cz` 代替 `git commit`，它会引导你填写规范的 Commit Message。

---

**6. 总结**
✅ 好的 Commit Message 应该：
• 简洁明了，准确描述变更内容

• 遵循 `<type>: <description>` 格式

• 关键变更可加 `BREAKING CHANGE` 或关联 Issue

• 使用工具（Husky + commitlint）强制规范


这样可以让团队协作更高效，代码历史更清晰！ 🚀