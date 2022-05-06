---
title: JQuery面向对象写法
tags:
  - JQuery
  - JavaScript
  - 面向对象
categories: JavaScript
abbrlink: 64020
date: 2018-04-19 09:52:00
updated: 2018-04-19 09:52:00
---
书写Jquery代码时，普通的面向过程的写法可以实现功能，但不利于后期维护。现介绍面向对象的写法。


``` html
<html>
	<head>
		<script src="jquery.min.js"></script>
	</head>
	<body>
		<button data-event="list">列表</button>
		<button data-event="search" data-name="大班">搜索</button>
		<button data-event="add">添加</button>
		<button data-event="update">修改</button>
		<button data-event="del">删除</button>
	</body>
</html>
```
``` javascript
<script>
var clickAct = {
	btn: $('button'),
	init: function(){
		var that = this;
		this.btn.click(function(){
			var func = $(this).attr('data-event');
			that[func]($(this).attr('data-name'));
		})
	},
	
	list: function(param){
		console.log('1');
	},
	
	search: function(param){
		console.log(param);
		
	},
	
	add: function(param){
		console.log('3');
	},
	
	update: function(param){
		console.log('4');
	},
	
	del: function(param){
		console.log('5');
	}
}

clickAct.init();
</script>
```
