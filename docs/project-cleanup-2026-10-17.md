# 项目精简记录

日期：2026-10-17。本次与博客体验优化一并完成，尚未部署。

## 依赖

移除 12 个直接依赖：

- `hexo-theme-webstack`：当前只使用本地 itsneko 主题。
- `hexo-deployer-cos-enhanced`：部署配置未使用 COS。
- `hexo-generator-index`：与保留的置顶首页生成器重复。
- `hexo-generator-search`：已改为站内纯文本 JSON 分片索引。
- `hexo-baidu-url-submit`、`hexo-generator-baidu-sitemap`：未使用的提交链路和重复站点地图；保留通用 sitemap 与百度前端推送。
- `hexo-lazyload-image`：由主题图片加载规则替代。
- `hexo-tag-aplayer`：音乐页使用自有按需加载器，不使用插件标签。
- `hexo-prism-plugin`：保留 Hexo 内置 Highlight.js 与主题代码工具条。
- `hexo-filter-github-emojis`：正文未使用该插件的 emoji 语法。
- `hexo-asset-image`：无 post asset 文件夹和相关图片使用；正文资源使用明确路径。
- `save`：没有项目调用。

卸载操作移除了 666 个间接包，之后为当前摘要、索引与检查逻辑显式添加 Cheerio。最终保留 18 个直接依赖，以 `package-lock.json` 为准。旧 `yarn.lock` 已归档，README 和 CI 统一使用 npm，移除针对旧 Git URL 依赖的 CI 配置。

仓库原先跟踪的 21,380 个 node_modules 文件已使用 git rm --cached 取消跟踪；实际本地依赖仍保留。此项 Git 索引变更已暂存，尚未提交。没有重写 Git 历史。

## 文件与主题

57 个遗留文件加上旧 yarn 锁文件、重复链接卡片脚本，共 59 个文件已移到 `.cleanup-backup/2026-10-17/`，排除在 Git 和发布输出之外。

包括：

- WebStack 配置、空 README、占位 urls.txt、绕过当前构建流程的旧 up.sh、空视频页、空 archives 目录和 IDE 项目文件。
- Gitalk、Gitment、Disqus、Livere、Valine、MiniValine 旧评论模板及相关资源；保留正在使用的 Waline。
- 未被模板引用的旧统计图、推荐、项目技能展示等控件，以及旧 ECharts、DPlayer、背景特效、代码工具条和 Tocbot 资源。
- 未引用的 artitalk、moments、打字特效脚本，以及重复的 LinkCard 脚本。

模板中的对应引用、未启用功能的配置和旧插件配置同步清理。保留音乐与相册页面及其资源、书籍旧链接跳转、文章、工具下载、赞赏信息和图片原图。仅使用本地 Font Awesome 5，移除重复的 Font Awesome 4 CDN，相关图标已适配。

批量永久删除未获自动审批，因此采用本地可恢复归档；未丢弃这些文件。恢复时应从备份中选取具体文件，并同时检查对应配置与依赖，而不是整体覆盖当前项目。

## 验证

- 干净构建生成 1378 个文件。
- 326 篇文章日期、标题和 abbrlink 唯一性检查通过。
- 947 个主题页面的元信息、站内资源、专题和搜索记录检查通过。
- 79 个书籍页面的目录和上下章检查通过。
- 两个工具 EXE、README、文件大小和 SHA-256 检查通过。
- 本地 Edge 验证 17 个 Mermaid 图表、Shor 页面公式、手机目录、专题与搜索；代表文章无 JavaScript 错误。

前端不再请求也不再生成旧 `search.xml`，使用 `search/posts.json` 和 `search/books.json`。

旧 `.deploy_git` 部署缓存和本次 `.book-qa` 临时检查文件也归档到同一备份目录。手动部署需要时会重新生成部署缓存。
