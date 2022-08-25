---
title: PHP使用ES
tags:
  - PHP
  - elasticsearch
categories: PHP
abbrlink: 'php-elasticsearch'
date: 2022-04-06 23:22:05
updated: 2022-04-06 23:22:05
---

### 安装步骤

1. 下载安装java
`https://www.oracle.com/java/technologies/downloads/#jdk18-windows`
查看版本 java -version
![](/images/php_es_1.png)
    
2. 下载es
`https://www.elastic.co/cn/downloads/elasticsearch`
    
3. 修改config\elasticsearch.yml文件的配置项
```
xpack.security.enabled: false
xpack.ml.enabled: false
```

4. 双击 bin\elasticsearch.bat
等几十秒后，在浏览器访问：`localhost:9200`
![](/images/php_es_2.png)

5. 下载Kibana
`https://www.elastic.co/cn/downloads/kibana`
运行：`bin\kibana.bat`
访问`http://localhost:5601`