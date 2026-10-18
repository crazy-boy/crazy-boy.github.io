# 全站质量审查

先构建再审查实际生成 HTML，并运行已有书籍检查。把本地构建结论、线上抓取结果和真实浏览器性能数据分开，不能将源码文件体积当成网络传输量，也不能将抓取失败直接认定为线上故障。

## 数据来源

- 遍历 `source/_posts/**/*.md` 统计文章和元数据。使用 `hexo-front-matter` 时先将 CRLF 转换成 LF，避免 frontmatter 被当成正文。
- `db.json` 可辅助统计 Post、Category、Tag 及 PostCategory/PostTag 关联，但缓存里的 content 可能为空，不能据此认定文章正文为空。
- 用 `public/` 下对应页面核对发布日期、实际元信息、脚本、图片、图表与链接。源文件日期错误时，构建可能采用文件时间而继续成功；构建成功不代表内容正确。
- 短正文、单篇分类和标签是人工复核候选，不能直接当作低质量或删除依据。

## 检查重点

- 日期合法性、标题与版本一致性、重复文章、稳定的 abbrlink/permalink、摘要和更新时间。
- 主题 head 中计算的描述是否实际输出，canonical、分享元信息和结构化信息是否符合页面内容。
- Mermaid 代码块是否真的生成图表，含公式的页面是否真正接入公式渲染；不能只看主题 enable 开关。
- 手机目录是否有可操作入口、缩放是否受限，代码和表格是否可横向阅读。
- 检查站内 URL 时解析相对路径、URL 编码和目录 index.html；区分共享模板缺失资源与单篇断链，并单独检查错误的伪 JavaScript 链接。HTML 扫描不覆盖 CSS 背景图、srcset 和所有运行时请求。
- 统计搜索索引大小，查看首次加载、主线程解析、结果排序与失败重试；区分未压缩体积和实际传输量。
- 图片大小需结合具体页面的引用、首屏位置和懒加载判断；下载 EXE 和未访问相册不属于首页加载量。
- 合并分类或文章之前考虑旧 URL；优化全局依赖前检查现有页面是否依赖插件副作用。

报告按影响和优先级组织，给出具体文件、已验证现象、建议与验证边界。抽样技术内容时明确范围，不声称逐篇核实全站事实。用户只要求审查时，交付报告，保留文章和主题原状。

## 当前实现与精简约定

- 使用 npm 和 package-lock.json；当前只有 itsneko 本地主题，勿为旧 WebStack 配置重新安装主题。保留 `hexo-generator-index-pin-top`，不再同时安装普通首页生成器。
- `scripts/site-quality.js` 负责正文摘要、相关阅读、图表源码保留、图片加载规则与分片搜索索引；HTML 解析依赖显式声明为 Cheerio。
- `scripts/article-vendors.js` 从 npm 依赖生成本站 Mermaid/MathJax 资源；固定版本在 package.json 中，不把 node_modules 或生成的 vendor 文件夹提交到源码。图表预处理需在 Hexo 高亮前执行，代码工具条不能覆盖图表。
- 公式需兼容 kramed 输出的 math/tex script。图表语法与甘特图示意日期应实际验证；Mermaid 的 m 表示分钟，不能用作月份。全站脚本不得使用替换 img 标签的正则去修改 script/JSON-LD 内的示例字符串。
- 文章摘要剔除代码；搜索正文保留代码，并去掉高亮行号。索引位于 search/posts.json 和 search/books.json，不再生成 search.xml。
- 专题入口的数据源是 source/_data/reading_topics.json，页面为 source/topics/index.md；新增精选项时用真实 abbrlink，并执行 check:site。
- 现有 Waline 评论、音乐加载器、相册、赞赏页、source/posts 中的书籍旧地址跳转以及图片原图仍在使用或需要保留。不要仅因导航菜单未列出就删除独立页面。
- 清理插件后检查是否有自有脚本依赖其间接依赖；需要的解析器等应显式声明。一次只保留一套首页生成器、代码高亮链路和同类运行组件。
- 批量清理前核对引用，优先可恢复归档；本项目 .cleanup-backup/ 为忽略目录，不参与发布。不要将备份作为源码重新引入。
- `.gitignore` 不能取消已有文件的跟踪。清理依赖时先用 `git ls-files node_modules` 检查；本项目已取消跟踪 21,380 个依赖文件，保留本地安装，不要重新加入 Git。使用 `git rm --cached` 的索引变更会暂存，交付时明确尚未提交。

## GitHub Pages 部署排查

- 源码推送到 `hexo` 分支触发 `.github/workflows/pages.yml`，依次安装、clean、build、check:books、check:site，通过后才上传产物并部署 Pages。任一步失败都会让线上保留旧版本；先查对应提交的 Actions 状态和失败步骤，再判断缓存。
- Windows 文件系统通常不区分大小写，GitHub 的 Linux runner 区分。资源引用须与 Git 中的文件名逐字一致，例如相册实际文件为 `.jpg` 时不能引用 `.JPG`。`check:site` 已加入静态资源逐段大小写检查，并覆盖懒加载图片的 `data-src`；不要为让发布通过而关闭断链校验。
- 构建和校验在工作流中保留独立步骤，便于定位失败。修复后执行 build、check:books 和 check:site；本地通过不等于远端已经发布成功，推送和线上验证按用户授权执行。
