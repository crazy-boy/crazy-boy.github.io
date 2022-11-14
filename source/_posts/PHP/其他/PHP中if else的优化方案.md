---
title: PHP中if else的优化方案
tags: [PHP笔记]
categories: PHP
abbrlink: 'php-if-else'
date: 2022-10-18 22:52:19
updated: 2022-10-18 22:52:19
---

<div class="note info">前言：在项目开发中，经常会遇到多个复杂if else的情况，下面说说这种情况的优化方案。</div>

### 提前return
 让正常流程走主干，非正常流程提前return，去除不必要的else，适用于函数参数校验。
- 优化前
```php
    if (condition){
        doSomething
    }else{
        return ;
    }
```
- 优化后
```php
    if (!condition){
        return ;
    }
    doSomething
```

### 使用三目运算符
 适用于根据条件给变量赋值。
- 优化前
```php
    if (condition){
        $status = 1;
    }else{
        $status = 0;
    }
```
- 优化后
```php
    $status = condition ? 1 : 0;
```

### 合并条件表达式
- 优化前
```php
    if (condition1){
        return true;
    }
    
    if (condition2){
        return true;
    }else{
        return false;
    }
```
- 优化后
```php
    if (condition1 || condition2){
        return true;
    }else{
        return false;
    }
```

### 使用switch case优化
 php8可以使用match表达式
- 优化前
```php
    class A{
        public static function handle(string $act, int $userId){
            if ($act == 'sign in') {
                self::sign($userId);
            } elseif ($act == 'register user') {
                self::register($userId);
            } elseif ($act == 'change password') {
                self::changePwd($userId);
            }
        }
    
        protected static function sign(int $userId){}
    
        protected static function register(int $userId){}
    
        protected static function changePwd(int $userId){}
    
    }
```
- 优化后
```php
    class A{
        public static function handle(string $act, int $userId){
            switch ($act) {
                case 'sign in':
                    self::sign($userId);
                    break;
                case 'register user':
                    self::register($userId);
                    break;
                case 'change password':
                    self::changePwd($userId);
                    break;
                default:
                    break;
            }
        }
    
        protected static function sign(int $userId){}
    
        protected static function register(int $userId){}
    
        protected static function changePwd(int $userId){}
    
    }
```
效果：和原来的差不多，每次新增方法后还得修改代码。

### 使用枚举
- 优化前
```php
    if ($status == 0){
        return '待支付';
    }elseif($status == 1){
        return '已支付';
    }else{
        return '支付失败';
    }
```
- 优化后
```php
    $orderStatus = [
        0 => '待支付',
        1 => '已支付',
        2 => '支付失败',
    ];
    
    return $orderStatus[$status];
```

### 表驱动法
- 优化前
```php
    class A{
        public static function handle(string $act, int $userId){
            if ($act == 'sign in') {
                self::sign($userId);
            } elseif ($act == 'register user') {
                self::register($userId);
            } elseif ($act == 'change password') {
                self::changePwd($userId);
            }
        }
    
        protected static function sign(int $userId){}
    
        protected static function register(int $userId){}
    
        protected static function changePwd(int $userId){}
    
    }
```
- 优化后
```php
    class A{
        private static $acts = [
            'sign in' => 'sign',
            'register use' => 'register',
            'change password' => 'changePwd',
        ];
    
        public static function handle(string $act, int $userId){
            $fun = !empty($act) && isset(self::$acts[$act]) ? self::$acts[$act] : null;
            if ($fun) call_user_func($fun, $userId);
        }
    
        protected static function sign(int $userId){}
    
        protected static function register(int $userId){}
    
        protected static function changePwd(int $userId){}
    
    }
```
效果：新增方法后，只需修改配置项，不用变更其他代码。

### 策略模式+工厂方法消除if-else
参考：https://www.phpmianshi.com/?id=197