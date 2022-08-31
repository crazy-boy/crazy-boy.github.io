---
title: Linux中rz的使用
tags: [rz/sz]
categories: Linux
abbrlink: 'rz-on-linux'
date: 2019-07-02 19:20:00
updated: 2019-07-02 19:20:00
---

我们常常需要在客户端和服务器(windows和linux)之间互传文件，这就可以使用rz(sz)命令。

1. 如果服务器不支持rz命令，需安装：
    ``` bash
        sudo yum -y install lrzsz
    ``` 

2. 从客户端上传文件(可多选)到服务器：
    ``` bash
        sudo rz
        sudo rz -be
    ``` 

3. 从服务端发送文件到客户端：
    ``` bash
        sudo sz filename
    ``` 

4. 卸载rz：
    ``` bash
        yum remove lrzsz
    ``` 