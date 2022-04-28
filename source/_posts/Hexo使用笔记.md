---
title: Hexo使用笔记
tags:
  - Hexo
  - NexT
categories: Hexo
abbrlink: 3280
date: 2018-06-09 15:12:00
updated: 2018-06-09 15:20:00
---
这个博客网站是使用hexo搭建，部署在github上的，总的来说，不太复杂。现记录一些常用的操作，方便大家参考。

<!-- more -->

##### 常用命令
1. 清除当前缓存		` $ hexo clean `
2. 重新生成并部署到github上		` $ hexo g -d `
3. 启动服务		` $ hexo s`
4. 新建页面		` $ hexo new page categories `

#### 常用设置
1. 如何在首页设置「阅读全文」? 
    在首页显示一篇文章的部分内容(或者摘要)，并提供一个链接(「阅读全文」)跳转到文章详情页。 NexT 提供以下三种方式：

    1. 在文章中使用 <!-- more --> 手动进行截断，Hexo 提供的方式(<font color="#FF0000">推荐</font> )
    2. 在文章的 [front-matter](https://hexo.io/docs/front-matter.html) 中添加 description，并提供文章摘录
    3. 自动形成摘要，在 主题配置文件_config.yml 中添加：
    ``` bash
        auto_excerpt:
          enable: true
          length: 150
    ```
默认截取的长度为 150 字符，可以根据需要自行设定。
		
建议使用 <!-- more -->方式，既可以精确控制需要显示的摘录内容， 还可以让 Hexo 中的插件更好的识别。	