---
title: PHP实现方法运行前(后)执行指定的程序
tags: [PHP笔记]
categories: PHP
abbrlink: 'php-auto-run-func'
date: 2022-06-02 21:02:57
updated: 2022-06-02 21:02:57
---


在PHP中，利用__call()，可实现方法运行前/后执行指定的程序片段。

下面演示下，在test方法执行后自动执行afterTest方法

```php
trait A{
    public function __call($method, $args){
        if (!method_exists($this, $method)) {
            throw new Exception('no such method: ' . $method);
        }
        $afterMethod = 'after'.ucfirst($method);
        if (method_exists($this, $afterMethod)) {
            $rs = call_user_func_array([$this, $method], $args);
            if ($rs['code'] == 0) {
                call_user_func_array([$this, $afterMethod], $rs);
                return $rs;
            }
        } else {
            return call_user_func_array([$this, $method], $args);
        }
    }

    private function afterTest(...$args){
        print_r($args);
    }
}

Class B{
    use A;
    protected function test($id,$name): array{
        return $id>10 ? ['code'=>1,'msg'=>'ok'] : ['code'=>0,'msg'=>'error'];
    }
}

$rs = (new B())->test(7,'张三');
```
输出结果为：
`Array ( [0] => 0 [1] => error )`

不难看出，这种处理方式存在以下两个缺陷：
1. 方法需设为外界不可用，protected/privated，在IDE中就无法跳转，其他人维护起来比较困难；
2. 代码耦合度高，相互影响，不利于后期扩展。