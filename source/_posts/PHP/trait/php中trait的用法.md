---
title: php中trait的用法
tags:
  - trait
categories: PHP
abbrlink: 'php-trait'
date: 2022-04-25 02:17:20
updated: 2022-05-08 12:57:00
---

<div class="note info">trait是php的一种代码复用的方法。</div>


### 用法
#### 1. 通过use Trait类来使用
可以将一些常用的处理封装到trait类里，在其他地方直接use就可以了。
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

#### 2. 优先级
当前类中的方法会覆盖trait方法，而trait方法用覆盖了基类中的方法。

```php
class Base{
    public function sayHello(){
        echo 'Hello ';
    }
}

trait SayWorld{
    public function sayHello(){
        parent::sayHello();
        echo 'world!';
    }
}

class MyHelloWorld extends Base{
    use SayWorld;
}

$obj = new MyHelloWorld();
$obj->sayHello();     
//output: Hello world!
```

#### 3. 多个trait
通过逗号分隔，在 use 声明列出多个 trait类


### 常用的trait类

#### 1. 单例类

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

#### 2. 错误处理类
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

### 参考资料
https://www.php.net/manual/zh/language.oop5.traits.php