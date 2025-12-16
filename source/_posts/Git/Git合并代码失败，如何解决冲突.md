---
title: Git合并代码失败，如何解决冲突
tags: [Git]
categories: [Git]
abbrlink: 'git-resolve-merge-conflicts'
date: 2025-10-14 09:54:37
updated: 2025-10-14 09:54:37
---

如果在项目上，你希望将 `feature/xx` 分支的代码合并到 `develop` 分支，但提示有冲突。以下是完整的解决流程示例：

---
![](/images/resolve-merge-conflicts_1.png)

```bash
# 1. 查看冲突文件
git status

# 2. 打开冲突文件并解决
code app/Services/Match/Match3/Match3Config.php

# 3. 在编辑器中解决冲突后保存

# 4. 标记为已解决
git add app/Services/Match/Match3/Match3Config.php

# 5. 检查是否还有其他冲突文件
git status

# 6. 完成合并
git commit -m "Resolve merge conflicts from develop branch"

# 7. 推送到远程
git push origin HEAD
```

#### 如果冲突涉及多个文件**
```bash
# 查看所有冲突文件
git diff --name-only --diff-filter=U

# 批量解决后一次性提交
git add .
git commit -m "Resolve all merge conflicts"
```
记住：解决冲突时要仔细检查代码逻辑，确保合并后的代码能正常工作。如果不确定，可以请同事帮忙审查。