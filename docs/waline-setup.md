# Waline 留言部署（Netlify + Neon）

博客前端已改为 Waline，旧 Valine 已关闭。旧测试留言不迁移。
当前后端项目：crazy-boy-comments，数据库：Neon / blog-comments / neondb。
函数地址：https://crazy-boy-comments.netlify.app/.netlify/functions/comment

## 修复函数打包

将本目录 waline-netlify/netlify.toml 的内容复制到 **blog-comments 仓库根目录**的 netlify.toml。
将 waline-netlify/comment.js 的内容复制到该仓库的 netlify/functions/comment.js。
这两个文件是评论仓库的配置参考，不是 Hexo 的部署配置。

保留 Waline 动态加载源码，排除 MathJax 包，并在函数初始化前关闭留言公式渲染。
普通 Markdown 留言继续支持。博客和书籍正文公式不受影响。
不要只排除依赖而忘记替换 comment.js，否则留言渲染仍可能尝试加载缺失模块。
后续升级 Waline 必须重新检查打包大小和渲染兼容性。

## 环境变量（在 Netlify 控制台填写，不提交密码）

- PG_HOST：Neon 主机名
- PG_PORT：5432
- PG_DB：neondb
- PG_USER：Neon 数据库用户名
- PG_PASSWORD：Neon 数据库密码
- PG_SSL：true
- SITE_URL：https://crazy-boy.com
- SITE_NAME：飞奔的蜗牛

Neon 数据库已执行官方 waline.pgsql，建立 wl_comment、wl_counter、wl_users。
Netlify 项目须允许公开访问。推送评论仓库 master 后等待最新部署 Published。
然后验证函数地址下 /ui 和 /api/comment，不能只看构建成功。
第一位注册用户为管理员；在函数地址下 /ui/register 注册管理员后，再接入博客。

## 博客接入

在 themes/itsneko/_config.yml 的 waline.serverURL 填写上方完整函数地址，不加 /ui 或 /api。
线上管理页及评论读取接口已验证成功，管理员已由站主注册。本地博客配置已填入服务地址，待提交发布。
博客 _config.yml 的 url 保持 https://crazy-boy.com。
执行 npm run build 和 npm run check:books 后，提交并推送 hexo 分支，由 GitHub Actions 发布。

本地和非正式站点不加载评论客户端，避免将测试内容发布到线上。
不要取消该保护来测试正式数据库；需要写入测试时使用独立测试服务。

参考：https://waline.js.org/guide/deploy/netlify.html
参考：https://docs.netlify.com/build/configure-builds/file-based-configuration/

## Lambda 模块兼容设置

如果线上出现 ERR_REQUIRE_ESM（例如 @mdit/plugin-emoji），在 Netlify 控制台环境变量中设置：

- AWS_LAMBDA_JS_RUNTIME = nodejs24.x
- NODE_OPTIONS = --experimental-require-module

变量作用域需覆盖 Functions；运行时版本变量也需供部署过程读取，选择全部作用域即可。
如果 NODE_OPTIONS 已有参数，追加该参数，不要覆盖其他必要设置。
保存后重新部署。Lambda 默认关闭 require(ESM)，本地 Node.js 24 默认开启，两者存在差异。
官方说明：https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html
运行时配置：https://docs.netlify.com/build/functions/configuration/
