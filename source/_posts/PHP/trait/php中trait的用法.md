---
title: php中trait的用法
tags:
  - trait
categories: PHP
abbrlink: 'php-trait'
date: 2022-04-25 02:17:20
updated: 2022-05-08 12:57:00
---



### 用法

1. 可以将一些常用的处理封装到trait类里，在其他地方直接use就可以了。

 例如：封装单例
 先创建Singleton类，代码如下：
```php
   trait Singleton{
       private static $instance;
   
       /**
        * @param ...$args
        */
       public static function getInstance(...$args) {
           if (!isset(self::$instance)) {
               self::$instance = new static(...$args);
           }
           return self::$instance;
       }
   }
```
再创建Test类，代码如下：
```php
    class Test{
        use Singleton;
        public function test(){
                return 'test';
        }    
    }
```
调用：
```php
    echo Test::getInstance()->test();
```


### 常用的trait类

1. 单例类

```php
    /**
     * 用作单例
     * Trait Singleton
     */
    trait Singleton{
        private static $instance;
    
        /**
         * @param ...$args
         */
        public static function getInstance(...$args){
            if (!isset(self::$instance)) {
                self::$instance = new static(...$args);
            }
            return self::$instance;
        }
    }
```

2. 错误处理类

```php
   namespace app\common\helper;
   
   /**
    * 错误操作类
    * Trait Error
    * @package app\common\helper
    */
   trait Error{
       private $_code;
       private $_error;
   
       protected function setError(int $code, string $msg): void{
           $this->_code = $code;
           $this->_error = $msg;
       }
   
       public function getError(): ?array{
           return isset($this->_code) ? ['code' => $this->_code, 'msg' => $this->_error] : null;
       }
   }
```

使用方法：

```php
    class A {
        use Error;
        public function test(){
            ……
            if(){
                 $this->setError(0, '数据不存在');
                return null;           
            }
        }
    }
```

调用：

```php
    $s = new A();
    $rs = $s->test();
    if ($error = $s->getError()) {
        extract($error);
        /**
         * @var $code
         * @var $msg
         */
        $this->setError($code, $msg);
        return false;
    }
```