---
title: PHP实现AES加解密
tags: [加解密]
categories: [PHP]
abbrlink: 'php-aes-encrypt'
date: 2018-04-20 10:05:00
---
<div class="note info">系统中的账号信息在进行存储的时候，需要做相应的加密处理；比如用户密码一般是以密文形式存储，而且是不可逆的，常用的就是md5加密；而对于某些账户信息(如：手机号码、银行卡号等)就需要进行可逆加密(如：AES)保存，这样既可以保证数据的安全性，又不影响正常的业务处理。</div>

下面介绍一下以PHP实现AES加密解密：

### 1. AES加密解密类

``` php
namespace libs;
/**
* 利用mcrypt做AES加密解密
* 支持密钥：64bit（字节长度8）
* 支持算法：DES
* 支持模式：ECB
* 填充方式：PKCS5
*/
class Aes{
    const CIPHER = MCRYPT_DES;
    const MODE = MCRYPT_MODE_ECB;

    /**
     * 加密
     * @param string $str	需加密的字符串
     * @param string $key	密钥(8位)
     * @return string   密文
     */
    public static function encode($str,$key){
        $size = mcrypt_get_block_size ( MCRYPT_DES, 'ecb' );
        $str = self::pkcs5_pad($str, $size);
        $iv = mcrypt_create_iv(mcrypt_get_iv_size(self::CIPHER,self::MODE),MCRYPT_RAND);
        $result = mcrypt_encrypt(self::CIPHER, $key, $str, self::MODE, $iv);
        return base64_encode($result);
    }

    /**
     * 解密
     * @param string $str   密文
     * @param string $key   密钥(8位)
     * @return string   明文
     */
    public static function decode($str,$key){
        $str = base64_decode($str);
        $iv = mcrypt_create_iv(mcrypt_get_iv_size(self::CIPHER,self::MODE),MCRYPT_RAND);
        $str = trim(mcrypt_decrypt(self::CIPHER, $key, $str, self::MODE, $iv));
        return  self::pkcs5_unpad($str);
    }

    /**
     * PKCS5填充
     * @param $text
     * @param $blocksize
     * @return string
     */
    private static function pkcs5_pad($text, $blocksize) {
        $pad = $blocksize - (strlen($text) % $blocksize);
        return $text . str_repeat(chr($pad), $pad);
    }

    /**
     *
     * @param $text
     * @return bool|string
     */
    private static function pkcs5_unpad($text) {
        $pad = ord($text{strlen($text) - 1});
        if ($pad > strlen($text)) {
            return false;
        }
        if (strspn($text, chr($pad), strlen($text)-$pad) != $pad) {
            return false;
        }
        return substr($text, 0, -1 * $pad);
    }
}
```

### 2. 调用

``` php
namespace app\modules\demo\controllers;

use app\common\components\Controller;
use libs\Aes;

class TestController extends Controller{

    public function actionTest(){
        $key = 'WGiSP3UQ';
        $str = '18958019299';
        $enStr = Aes::encode($str,$key);
        $deStr = Aes::decode($enStr,$key);
        var_dump($str,$enStr,$deStr);
    }
}
```

### 3. 访问http://127.0.0.1/web/demo/test/test ，运行结果如下：
``` php
string(11) "18958019299" 
string(24) "WiBZggO/DRaczJ3wSirvEw==" 
string(11) "18958019299"
```