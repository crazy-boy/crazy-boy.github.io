---
title: Go语言基础
tags: [Go]
categories: Go
abbrlink: 'go-note'
date: 2018-06-09 21:57:06
updated: 2018-06-09 21:57:32
---
自学Go语言的过程漫长而坎坷，先记录一些基础知识。

### 执行go文件
`E:\Go_WorkSpace>go run test.go`

### 把go程序编译成exe文件
`E:\Go_WorkSpace>go build test.go`

### 打印内容
`fmt.Printf("Hello,World!")`

### switch语句中，多个case共用一组执行语句
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

### GoLand使用
新部署项目后，需通过`go mod download` 下载第三方依赖包，如果报错，需设置Go Modules中的Proxy为：`https://goproxy.cn`

### GoLand使用下载第三方依赖包
1、 IDE-》setting-》Go-》Go Modules中，设置代理：https://goproxy.cn
![](/images/goland_1.png)
2、项目中，创建go.mod文件，包含需要引入的依赖包，
如：导入 gin：require github.com/gin-gonic/gin latest
在Terminal上，运行go mod download即可，系统会自动将版本号回填到go.mod中
![](/images/goland_2.png)