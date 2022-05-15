---
title: Excel使用小技巧
tags:
  - Excel
categories: Windows
abbrlink: e939ff3c
date: 2019-10-26 14:16:36
updated: 2019-10-26 14:16:36
---

### 1. excel固定第一行：
选择第二行，点击视图里的冻结窗口即可。

### 2. excel分列：
	如：将某一列的数据由C4159D5953D8转为C4:15:9D:59:53:D8格式：
```shell
# 公式为
=left(A1,2) & ":" & mid(A1,3,2) & ":" & mid(A1,5,2) & ":" & mid(A1,7,2) & ":" & mid(A1,9,2) & ":" & right(A1,2)
```
### 3. 删除重复项：
    选中数据区域->数据->删除重复项->确定
    
### 4. VLOOKUP函数的使用