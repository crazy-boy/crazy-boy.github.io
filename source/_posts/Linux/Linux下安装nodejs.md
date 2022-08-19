---
title: Linux下安装nodejs
tags:
  - Linux
  - nodejs
categories: Linux
abbrlink: 'linux-install-nodejs'
date: 2019-10-11 20:04:51
updated: 2019-10-11 20:04:51
---

### 1. 下载nodejs
```
wget https://nodejs.org/dist/v8.11.4/node-v8.11.4-linux-x64.tar.xz
```

### 2. 解压nodejs
```
tar xvf node-v8.11.4-linux-x64.tar.xz #解压
mv node-v8.11.4-linux-x64 node-v8.11.4 #改短名
```

### 3. 查看版本
```
cd /node-v8.11.4/bin && ls #进入目录并列出
./node -v #查看node版本
node -v #无法获取，未配置
```

![](/images/linux_install_nodejs_1.png)

### 4. 配置
```
ln -s /node-v8.11.4/bin/node /usr/bin/node
ln -s /node-v8.11.4/bin/npm /usr/bin/npm
```

![](/images/linux_install_nodejs_2.png)

### 5. 清理安装包
```
rm -rf node-v8.11.4-linux-x64.tar.xz
```

### 参考
https://www.jianshu.com/p/8cdbe4f4b533
