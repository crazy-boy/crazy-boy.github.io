---
title: Git合并代码失败，如何解决冲突
tags: [Git]
categories: [Git]
abbrlink: 'git-resolve-merge-conflicts'
date: 2025-10-14 09:54:37
updated: 2025-10-14 09:54:37
---

如果在项目上，你希望将 `feature/xx` 分支的代码合并到 `develop` 分支，但提示有Git合并冲突。以下是完整的解决流程示例：

---
![](/images/resolve-merge-conflicts_1.png)

```bash
# 1. 查看冲突文件
git status

# 2. 逐个查看冲突部分，并手动解决
git diff app/Services/Activities/BaseActivity.php
sudo vi app/Services/Activities/BaseActivity.php

git diff app/Services/Activities/ShiningShoppingSpree/SSSService.php
sudo vi app/Services/Activities/ShiningShoppingSpree/SSSService.php

git diff app/Services/Activities/Tetris/TetrisService.php
sudo vi app/Services/Activities/Tetris/TetrisService.php

# 或用工具解决：git mergetool

# 3. 批量标记为已解决，并一次性提交
git add .
git commit -m "Resolve all merge conflicts"

# 7. 推送本地提交
# 确认冲突解决后，推送121个本地提交
git push origin develop

# 如果因为远程有更新被拒绝，先拉取最新：
git pull origin develop
# 可能又会产生新冲突，重复第一步解决冲突，直到成功推送。
```

记住：解决冲突时要仔细检查代码逻辑，确保合并后的代码能正常工作。如果不确定，可以请同事帮忙审查。