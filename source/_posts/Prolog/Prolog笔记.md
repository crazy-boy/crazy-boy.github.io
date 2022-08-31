---
title: Prolog笔记
tags: [Prolog]
categories: Prolog
abbrlink: ec2116cd
date: 2019-01-31 11:36:00
updated: 2019-01-31 11:36:00
---

## 1. 加载脚本
`?- ['E:/SWI-Prolog/test/friend.pl'].       %true`

## 2. 教程 
https://riptutorial.com/zh-CN/prolog

## 3. 简单的计算求解：
`?- X is 3*7.       %X = 21`

## 4. CLP（约束逻辑编程）库的使用
求解方程，CLP只能处理整数运算
    ```
        ?- use_module(library(clpfd)).
        ?- Y #= 3+4.                    %Y = 7.
        ?- 5 #= 4+W.                    %W = 1.
    ```

## 5. 单行注释
使用"%"

## 6. 知识库
事实 + 规则 = 知识库。       
事实是我们对这个世界直接观察的结果。规则是关于现实世界的逻辑推论。

## 7. 合一（unification）
找出那些使规则匹配的值。
合一有时候不是唯一的，可以通过“;”来进行追问，有时候我们可能不满足于一个答案。

## 8. 列表/元组
程序 = 算法 + 数据结构。      列表是变长的容器，元组是定长的容器。
    ```
    ?- (1,2,3) = (1,2,3).               %元组
    yes
    
    ?- [A,B,C] = [A,B,C].               %列表
    yes
    ```

## 9. 内置谓词
### length
获取列表的长度   `?- length([1,2,3],L).      %L = 3.`
### append
可以用来合并两个列表   
    ```
    ?- append([1],[2],What).      %What = [1, 2].
    ?- append([1],W,[1,2,3]).      %W = [2, 3].
    ```
### member
检查某一个值是否在一个列表内  
    ```
    ?- member(1,[1,2]).      %true.
    ?-  member(3,[1,2]).      %false.
    ``` 
    


