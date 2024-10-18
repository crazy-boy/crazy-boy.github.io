---
title: 高德地图API使用
tags: [高德地图]
categories: [第三方]
abbrlink: 'amap-api'
date: 2018-06-05 09:44:00
updated: 2018-06-05 14:07:00
---

1. 高德地图的覆盖物label默认是蓝框白底的，className为amap-marker-label，可以通过css来修改样式。如：
    ``` bash
    <style>
        .amap-marker-label{
            height:40px;
            width:120px;
            background-color: red;
            border: solid 1px black;
        }
    </style>
    ```

2. 高德地图，根据地址搜索经纬度，再次搜索时清除遮盖物：
    ``` bash
    var markers = [];	
    map.remove(markers);	
    markers.push(marker);
    ```	