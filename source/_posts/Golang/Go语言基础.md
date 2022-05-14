---
title: Go语言基础
tags:
  - Go
  - 语言基础
categories: Go
abbrlink: 4dbff8ff
date: 2018-06-09 21:57:06
updated: 2018-06-09 21:57:32
---
** 自学Go语言的过程漫长而坎坷，先记录一些基础知识：**

### 1. 执行go文件
`E:\Go_WorkSpace>go run test.go`
### 2. 把go程序编译成exe文件
`E:\Go_WorkSpace>go build test.go`
### 3. 打印内容
`fmt.Printf("Hello,World!")`
### 4. switch语句中，多个case共用一组执行语句
```shell
switch A{
	case a,b,c:
		...
	case d:
		...
	default :
		...
}
```
### 5. GoLand使用
新部署项目后，需通过`go mod download` 下载第三方依赖包，如果报错，需设置Go Modules中的Proxy为：`https://goproxy.cn`