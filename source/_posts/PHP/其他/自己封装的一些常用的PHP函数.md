---
title: 自己封装的一些常用的PHP函数
tags: [PHP函数]
categories: PHP
abbrlink: 61e2bcf6
date: 2022-02-27 21:26:25
updated: 2022-02-27 21:26:25
---

### 1. 将字符串每隔n位显示一个指定字符
``` php
    /**
     * 将字符串每隔n位显示一个指定字符
     * @param string $str   原始字符串
     * @param int $n        间隔位数
     * @param string $d     分隔符
     * @return string       结果字符串
     * eg: ed4a32c2=>ed:4a:32:c2
     */
    function divisionStr(string $str,int $n,string $d=" "):string{
        return join($d,str_split($str,$n)));
    }
``` 

### 2. 打印图片的每一个像素颜色值
``` php
    /**
     * 打印图片的每一个像素颜色值
     * @param string $picUrl    图片路径
     */
    function printPicPixels(string $picUrl): void {
        $i = imagecreatefrompng($picUrl);
        if (!$i)    return ;
        for ($y = 0; $y < imagesy($i); $y++) {
            for ($x = 0; $x < imagesx($i); $x++) {
                $rgb = imagecolorat($i, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;
                echo "rgb($r,$g,$b)";
            }
        }
    }
``` 

### 3. 字符串按照ASCII码顺序排序
```php
/**
 * 字符串按照ASCII码顺序排序
 * @param string $str 字符串
 * @param int $sort 排序
 * @return string
 */
function sortStr(string $str, $sort=SORT_ASC): string{
    $arr = str_split($str);
    if ($sort == SORT_ASC){
        asort($arr);
    }else{
        arsort($arr);
    }

    return join('', $arr);
}
```

### 4. 字节数转化为常用单位
```php
/**
 * 字节数转化为常用单位
 * @param int $size 字节数
 * @return string
 */
function convert(int $size): string{
    $unit = ['b', 'kb', 'mb', 'gb', 'tb', 'pb'];
    $exp = floor(log($size, 1024));
    return round($size / pow(1024, $exp), 2) . ' ' . $unit[$exp];
}
// 使用：查看内存使用 echo convert(memory_get_usage(false));
```

### 5. ping指定地址，用于监控服务器是否在线
```php
/**
 * ping 指定地址
 * @param string $address
 * @return bool
 */
public function pingHost($address){
    $address = parse_url($address);
    $host = isset($address['host']) ? $address['host'] : '';
    if(!$host)  return false;
    $status = -1;
    if (strcasecmp(PHP_OS, 'WINNT') === 0) {
        $rs = exec("ping -n 1 {$host}", $outcome, $status);  // Windows 服务器下
    } elseif (strcasecmp(PHP_OS, 'Linux') === 0) {
        $rs = exec("ping -c 1 {$host}", $outcome, $status);  // Linux 服务器下
    }

    return $status==0 ? true : false;
}

//$url = "https://cloud.tencent.com/document/api/457/37184?id=232";
//var_dump(pingHost($url));       //true
```