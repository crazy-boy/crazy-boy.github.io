---
title: php中，this、self、static的区别
tags: [PHP笔记]
categories: [PHP]
abbrlink: 'php-self-static'
date: 2022-06-02 20:28:32
updated: 2022-06-02 20:28:32
---


- this指当前类，不能用于静态成员函数中，使用形式：$this->
- self是对静态成员函数/变量的访问，使用形式：self::
- static和self很接近，唯一区别在于：self调用的是本身代码片段的这个类；而static调用的是从堆内存中提取出来的，即访问的是当前实例化的那个类。

下面看下测试代码：

```php
class A{
    public $name = 'Jams';
    protected static $age = 26;

    public function start(){
        echo get_called_class() . '==>' . $this->name . '==>' . $this::$age;
    }

    public static function getAge(){
        echo get_called_class() . '==>' . self::$age;
    }

    public static function getInfo(){
        echo get_called_class() . '==>' . static::$age;
    }
}

class B extends A{
    public $name = 'Kiv';
    protected static $age = 20;
}

(new B())->start();
B::getAge();
B::getInfo();
```
输出结果为：<code>
B==>Kiv==>20
B==>26
B==>20
</code>