---
title: ThinkPHP5 中clone Query对象
tags:
  - ThinkPHP
  - Query
categories: PHP
abbrlink: 54284
date: 2022-04-26 21:18:26
updated: 2022-04-26 21:18:26
---
当我们在给前端提供列表接口的时候，经常需要根据条件返回总条数和当页列表数据；这时，我们就需要复用共同的查询条件对数据库执行多次查询操作。

在Yii2里，可以通过clone处理：
```php
$query = Post::find()->where(['status'=>1]);
$query->andFilterWhere(['name'=>$kw]);
$count = (clone $query)->count();
$list = $query->limit(20)->offset(0)->orderBy(['id'=>SORT_DESC])->all()->asArray();
```
在thinkphp5中，使用如下代码进行clone，会存在问题，提示：`SQLSTATE[HY000]: General error: 2031`
```php
$offset = ($page - 1) * $pageSize;
$query = Db::name('artist_bill')->where(['month' => $month]);
$count = (clone $query)->count();
$list = $query->field('id,title,month')
    ->limit($offset, $pageSize)
    ->order(['id' => SORT_DESC])
    ->select();
```
- 如果把第3行改为：$count = $query->count();  第一个查询正常，之后的查询没有任何where条件；这是因为query执行完成后会把查询条件清空。
- 如果使用clone，打印处理的sql如下：
```sql
select count(*) from t_artist_bill where `month` = :where_AND_month;
```
初步认为是参数没有绑定上去。应该也是query内部引用了一个对象，对象在clone之后与原有对象是一个地址引用。通过一步一步断点输出，确认在$this->builder->select($options);之后获得了bind数据。因此只需要解绑clone前后对象的builder属性即可完成query对象的复制。查看query对象的属性，只有builder,connection是对象，但是connection我们希望在整个请求中是一个单实例，所以没必要区分。
最终修改,新建query子类，添加__clone方法,指定clone后对新对象执行php $this->setBuilder();保证 clone之后的builder是一个新实例。
这样就可以正常使用clone了。

另一种处理方式是把where条件提取出来共用：
```php
public static function getList(?string $month, int $page, int $pageSize): array{
    $offset = ($page - 1) * $pageSize;

    $where = [];
    if (!empty($month)) {
        $where['month'] = $month;
    }
    $query = Db::name('artist_bill');
    $count = $query->where($where)->count('id');

    $list = $query->where($where)->field('id,title,month')
        ->limit($offset, $pageSize)
        ->order(['id' => SORT_DESC])
        ->select();

    return ['count' => $count, 'list' => $list];
}
```
