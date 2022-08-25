---
title: Hexo使用笔记
tags:
  - Hexo
  - NexT
categories: 其他
abbrlink: 'hexo-notes'
date: 2018-06-09 15:12:00
updated: 2022-05-08 11:20:00
---
<div class="note info">前言：这个博客网站是使用hexo搭建，部署在github上的，总的来说，不太复杂。现记录一些常用的操作，方便大家参考。</div>

### 常用命令
1. 清除当前缓存		` $ hexo clean `
2. 重新生成并部署到github上		` $ hexo g -d `
3. 启动服务		` $ hexo s`
4. 新建页面		` $ hexo new page categories `
5. 快速构建		` $ hexo cl && hexo g && hexo s `

### 常用设置
#### 1. 如何在首页设置「阅读全文」? 
   在首页显示一篇文章的部分内容(或者摘要)，并提供一个链接(「阅读全文」)跳转到文章详情页。 NexT 提供以下三种方式：

   1. 在文章中使用 `<!-- more -->` 手动进行截断，Hexo 提供的方式(<font color="#FF0000">推荐</font> )
   2. 在文章的 [front-matter](https://hexo.io/docs/front-matter.html) 中添加 description，并提供文章摘录
   3. 自动形成摘要，在 主题配置文件_config.yml 中添加：
    ``` bash
        auto_excerpt:
          enable: true
          length: 150
    ```
默认截取的长度为 150 字符，可以根据需要自行设定。
		
建议使用 `<!-- more -->`方式，既可以精确控制需要显示的摘录内容， 还可以让 Hexo 中的插件更好的识别。	

### 常用插件
1. 文章生成永久短链接
`npm install hexo-abbrlink --save`
在站点配置项文件_config.yml下添加：
```
url: https://crazy-boy.com
root: /
permalink: archives/:abbrlink.html
abbrlink:
  alg: crc32  # 算法：crc16(default) and crc32
  rep: hex    # 进制：dec(default) and hex
permalink_defaults:
pretty_urls:
  trailing_index: true # Set to false to remove trailing 'index.html' from permalinks
  trailing_html: true # Set to false to remove trailing '.html' from permalinks
```
当然文章的短链部分可以在文章的首部进行设置，如：`abbrlink: 'hexo-notes'`，如果不设置就会自动生成随机短链。

2. 开启文章字数统计
`npm i --save hexo-wordcount`

3. 文章设置密码
`npm install --save hexo-blog-encrypt`
将"password"字段添加到文章的信息头：`password: abc123`
文章可以按标签进行加密，优先级为：文章信息头>按标签加密
文章信息头的设置示例
![](/images/hexo_notes_2.png)

_config.yml示例
```yaml
# Security
encrypt: # hexo-blog-encrypt
  abstract: 有东西被加密了, 请输入密码查看.
  message: 您好, 这里需要密码.
  tags:
  - {name: tagNameA, password: 密码A}
  - {name: tagNameB, password: 密码B}
  wrong_pass_message: 抱歉, 密码不太对哟.
  wrong_hash_message: 抱歉, 这个文章不能被校验, 不过您还是能看看解密后的内容.
```
如果tagNameA中的某篇博文不想被加密，只需把博文头部的password设置为""即可。

### 多台电脑同步更新hexo博客
- 在github上切个hexo分支，把源代码push上去。
- 在需要同步更新的电脑上进行如下操作：
    安装git
    下载安装nodejs
    node -v
    npm -v
    git clone xx.git
    删除主题下.git目录
    进入目录，执行下面命令：
    ```
    $ npm install
    $ npm install hexo-generator-search --save
    $ npm i hexo-permalink-pinyin --save
    $ npm install hexo-filter-github-emojis --save
    $ npm install hexo-generator-feed --save
    ```
  
### 参考文档
https://blog.csdn.net/sinat_37781304/article/details/82729029
https://github.com/blinkfox/hexo-theme-matery/blob/develop/README_CN.md
https://blog.csdn.net/qq_30105599/article/details/118302086