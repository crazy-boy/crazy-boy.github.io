# 写作与发布

## 日常使用

- 本地预览：`npm run server`，访问 http://localhost:4000/books/。
- 构建检查：`npm run build`，随后 `npm run check:books`。
- 新增、改名、调整章节顺序后执行 `npm run books`，已运行的预览服务若未更新则重启。
- 修改正文通常由 Hexo 自动刷新；不必每次 clean。
- 所有源码修改留在 hexo 分支。提交并推送后，Actions 构建、检查、发布。
- 手动旧部署方式：`npm run deploy`。启用 Actions 后日常不再使用它。

## 文件组织

普通博文在 source/_posts/；书籍在 source/books/<book-id>/。
source/books/index.md 是总书架；原有推荐书单保留。
books.json 登记每本书的信息。source/_data/book_catalog.json 是生成的目录，不手动编辑。
公共书籍布局：themes/itsneko/layout/book-reader.ejs。
书籍样式：themes/itsneko/source/css/crypto-book.css。

## 添加一本书

1. 在 books.json 添加对象：id（唯一英文短名）、title、shortTitle、subtitle、label、author、description、source（例如 source/books/my-book）。
2. 创建该目录，放入目录页和章节 Markdown。每篇都设置以下头部：

```yaml
---
title: 第一章 示例
abbrlink: getting-started
book: my-book
book_order: 100
book_kind: chapter
---
这里是正文。
```

- 每本书必须有一个 book_order: 0、book_kind: home 的目录页。
- kind 可用 home / part / chapter / section。
- book_order 数值控制阅读顺序，建议留间隔；同一本书不可重复。
- abbrlink 使用简短英文与连字符，同一本书不可重复。
- 执行 npm run books，自动填写 permalink、layout 和 book_id。
- 地址为 /books/<book-id>/<abbrlink>/，不同书可使用相同章节短名。
- 目录页正文保留在源文件，但网页使用自动目录，避免手工目录过时。

## 启用自动发布（一次性）

工作流：.github/workflows/pages.yml，仅在 hexo 分支推送或手动运行时触发。
使用仓库自带的 GITHUB_TOKEN，不需要创建个人令牌。
构建产物通过 Pages artifact 发布，不修改 master；master 保留旧网页历史。

1. 本地确认效果并检查通过后，将源码改动提交、推送到 hexo。
2. GitHub 仓库 Settings → Pages → Build and deployment → Source 选 GitHub Actions。
3. 确认 Custom domain 仍是 crazy-boy.com，DNS 保持当前配置；证书就绪后保持 Enforce HTTPS。
4. 若 github-pages 环境限制发布分支为 master，在 Settings → Environments 中允许 hexo。
5. Actions 页面运行 Build and deploy blog，并检查线上书架和原文章。
6. 出错时可把 Pages 来源改回原来的 master 分支根目录；旧 master 不会被本工作流改动。

未在本次本地开发中推送或修改 GitHub 设置。首次线上 Actions 运行需要单独确认。
