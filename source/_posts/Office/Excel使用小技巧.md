---
title: Excel使用小技巧
tags:
  - Excel
  - 使用技巧
categories: Office
abbrlink: 'excel-tips'
date: 2018-06-19 22:02:03
updated: 2018-09-02 15:43:00
---

1. excel固定第一行：选择第二行，点击视图里的冻结窗口即可。

2. excel分列：
	如将某一列的数据由C4159D5953D8转为C4:15:9D:59:53:D8格式：
	```公式为：=left(A1,2) & ":" & mid(A1,3,2) & ":" & mid(A1,5,2) & ":" & mid(A1,7,2) & ":" & mid(A1,9,2) & ":" & right(A1,2)```

3. 删除重复项：
    选中数据区域->数据->删除重复项->确定
    
4. VLOOKUP函数的使用