---
title: JS点击复制指定内容
tags:
  - JavaScript
  - 复制
categories: JavaScript
abbrlink: 6e2d0a48
date: 2019-07-02 19:41:00
updated: 2019-07-02 19:45:00
---
点击按钮，复制指定文本框内容，代码如下：

``` html
<script type="text/javascript">
function copy(){
    var str = document.getElementById("my-data");
    str.select(); // 选择对象
    document.execCommand("Copy"); // 执行浏览器复制命令
    alert("复制成功！");
}
</script>

<textarea cols="20" rows="10" id="my-data">我的测试内容</textarea>
<input type="button" onClick="copy();" value="复制" />
```
