---
title: JavaScript笔记
tags:
  - JavaScript
  - 笔记
  - 前端
categories: JavaScript
abbrlink: 59091
date: 2018-06-19 22:39:00
updated: 2018-11-09 9:49:00
---

1. 如果想获取ajax里的function返回值，可用同步ajax。
<escape><!-- more --></escape>

2. JavaScript不定参数
    ``` html
    <html>
    <head>
    <title>JavaScript不定参数</title>
    <script type="text/javascript">
     
    function test(){
        console.log(arguments);
        for( var i = 0; i < arguments.length; i++ ){
            console.log(arguments[i]);
        }
    }
     
    </script>
    </head>
    <body onload="test('one','two','three','four');">
    </body>
    </html>
    ```