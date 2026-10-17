---
name: project-backend
description: 维护 D:/github/hexo 个人 Hexo 博客，包括博文、书籍、工具下载、itsneko 主题页面与构建校验。在此仓库添加或更新内容时使用。
---

# 博客维护

本项目统一使用 npm，以 package-lock.json 为依赖版本依据。本项目是个人笔记博客，使用 Hexo 7 和本地主题 `themes/itsneko`，站点为 https://crazy-boy.com。在仓库根目录执行命令。先查看工作区已有修改，保留用户正在进行的工作。

## 目录与入口

- 个人博文：`source/_posts/`，沿用附近文章的 frontmatter 和分类约定。
- 书籍正文：`source/books/`；书目源配置：`books.json`；生成目录：`source/_data/book_catalog.json`。
- 工具：`source/tools/`。新增或更新下载工具时读 [references/tools.md](references/tools.md)。
- 全站配置、静态资源直出规则：`_config.yml`。
- 导航菜单与主题配置：`themes/itsneko/_config.yml`。
- 页面模板：`themes/itsneko/layout/`；主题样式：`themes/itsneko/source/css/`。

## 构建与验证

- `npm run build`：先执行文章元数据检查、准备书籍，再生成站点到 `public/`。
- `npm run server`：先准备书籍，再启动本地预览。
- `npm run check:books`：构建后检查书籍路由、目录和上下章导航，适用于书籍相关变更。
- `npm run clean`：清理 Hexo 缓存和生成输出；删除页面或下载后，先 clean 再构建，确保旧产物已移除。
- `public/`、`db.json`、`.deploy_git/`、`node_modules/` 是生成内容或本地依赖，不作为源码交付。

书籍准备脚本会规范化正文 frontmatter。构建后检查差异，确认没有意外修改正文。书籍页面要求唯一的 `abbrlink`、正确的 `book`、唯一非负 `book_order`，以及 `book_kind`（home/part/chapter/section）。参照已有书籍和 `tools/prepare-books.cjs`。

页面和工具改动以构建产物、链接和文件一致性校验为主；布局变化时补充浏览器预览。汇报修改内容、验证结果以及是否发布。

- `npm run check:content`：检查博文标题、日期和重复 abbrlink；prebuild 自动执行。
- `npm run check:site`：构建后检查元信息、站内资源、搜索、专题和下载哈希。

## 全站审查

整体检查内容组织、元信息、资源链接和阅读性能时，读 [references/site-quality.md](references/site-quality.md)。

## 发布

`npm run deploy` 会构建并向 `_config.yml` 的部署仓库推送。只要求编辑或拷贝内容时，完成本地修改和验证；发布、推送按用户实际授权执行。

## 注意事项

- 我是一个工作十多年的后端工程师，希望你在写文章的时候以我的角度来思考和书写，多借助现实中的例子来深入浅出的分析简述清楚。
- 文章详情页封面保持原来的 75vh 高度和绿色 SiteMotto 手写字体。提升标题清晰度时优先细描边、文字阴影；不要改成粗体无衬线大标题、添加标题底板或缩短封面。当前标题使用 div + heading 语义，保持用户认可的视觉样式。
