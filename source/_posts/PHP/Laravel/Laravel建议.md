---
title: Laravel建议
tags: [PHP,tips,Laravel]
categories: [PHP]
abbrlink: 'laravel-tips'
date: 2024-12-06 09:39:25
updated: 2024-12-06 09:39:25
---

#### 助手方法`blank()`和`filled()`
您是否知道 Laravel 附带了两个很酷的助手方法`blank()`和`filled()`,现在，您可以采用标准化方法来测试变量是否为空，无论其类型如何，甚至支持集合！
```php
<?php

// Will return true
blank('');
blank('    ');
blank(null);
blank(collect());
blank([]);

// Will return false
blank(0);
blank('string');
blank(true);
blank(false);
blank([1]);

// For the inverse, you can make use of filled()
```

#### 助手方法`words()`
有时，你可能想要限制字符串中的单词数量。好吧，Laravel 提供了一个方便的助手方法`words()`！🚀
```php
<?php

use Illuminate\Support\Str;

return Str::words("Don't refactor without tests.", 2);
// Don't refactor ...

return Str::words("Don't refactor without tests.", 2, ' 👀');
// Don't refactor 👀

// You can also use fluent string 😎
return str("Don't refactor without tests.")->words(2);
// Don't refactor ...
```

#### 数据表字段值增加或者减少的方法
有时我们需要通过增加或减少值来更新字段的值。通常，我们会编写查询来实现，但 Laravel 提供了优雅的方法来处理这个问题 🚀
```php
<?php

// Increment votes by 1
DB::table('users')->increment('votes');

// Increment votes by 5
DB::table('users')->increment('votes', 5);

// Decrement votes by 1
DB::table('users')->decrement('votes');

// Decrement votes by 5
DB::table('users')->decrement('votes', 5);

// Increment votes by 1 and set the name to John
DB::table('users')->increment('votes', 1, ['name' => 'John']);

// You can increment multiple columns at once
DB::table('users')->incrementEach([
    'votes' => 5,    // Will increment votes by 5
    'balance' => 100, // Will increment balance by 100
]);

// You can also use them with Eloquent
User::query()->incrementEach([
    'votes' => 5,    // Will increment votes by 5
    'balance' => 100  // Will increment balance by 100
]);
```

#### 检查给定Model键的值是否已更改
有时，我们希望检查给定Model键的值是否发生更改。 Laravel 提供了`originalIsEquivalent()`方法来执行此操作 🚀
```php
<?php

$user = User::firstOrFail(); // ['name' => 'old']

$user->name = 'old'; // Keep the old value

$user->originalIsEquivalent('name'); // true

$user->name = 'new'; // Change the value

$user->originalIsEquivalent('name'); // false
```

#### 人类可读的日期
您是否曾经想显示人性化日期而不是确切日期？例如“1 天前”或“一个月前”？Laravel 允许您使用`diffForHumans()`方法实现 🚀
```php
<?php
use Carbon\Carbon;

// 5 days ago
$post->created_at->diffForHumans();

// 5 days 23 minutes ago
$post->created_at->diffForHumans(['parts' => 2]);

// 5 days 24 minutes 36 seconds ago
$post->created_at->diffForHumans(['parts' => 3]);

// 1 second ago
Carbon::now()->diffForHumans();
```

#### `startOfHour()`方法
在处理时间时，您可能希望有一个准确的时间，例如 18:00:00。由于 Laravel 在后台使用 Carbon，因此您可以访问`startOfHour()` 🚀
```php
<?php

// 2024-12-05 09:05:55
echo Carbon::now()->format('Y-m-d H:i:s');

// 2024-12-05 09:00:00
echo Carbon::now()->startOfHour()->format('Y-m-d H:i:s');

// 2024-12-05 09:05:00
echo Carbon::now()->startOfMinute()->format('Y-m-d H:i:s');

// 2024-12-05 09:05:55
echo Carbon::now()->startOfSecond()->format('Y-m-d H:i:s');

// 2024-12-05 00:00:00
echo Carbon::now()->startOfDay()->format('Y-m-d H:i:s');

// 2024-12-01 00:00:00
echo Carbon::now()->startOfMonth()->format('Y-m-d H:i:s');
```

#### 使用“whereIntegerInRaw”进行更快的查询
当使用非用户输入的 whereIn 查询时，请选择 whereIntegerInRaw。这可以通过跳过 PDO 绑定和 Laravel 的 SQL 注入安全措施来加快查询速度 🚀
```php
<?php

// Instead of using whereIn()
Product::query()->whereIn('id', range(1, 10000))->get();

// Use WhereIntegerInRaw()
Product::query()->whereIntegerInRaw('id', range(1, 10000))->get();
```

#### 没有时间戳列
有时，你的表可能没有“created_at”和“updated_at”列。你可以通过将“timestamps”设置为 false 来指示 Laravel 不要更新它们 🚀
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;
}
```

#### Blade 转 HTML
你知道吗，你可以使用 Blade 将视图渲染为字符串，无论你想要什么？这很有用，因为你可以使用 Blade 构建动态字符串甚至 shell 脚本 🚀
```php
<?php

// This renders the blade file welcome.blade.php into an HTML string
$rendered = view('welcome', ['foo' => 'bar'])->render();
```

#### “doesntExist” 方法
有时您可能想检查数据库中是否存在某些记录。虽然检查计数或使用exists（）方法可以解决问题，但Laravel附带了“doesntExist”方法来优雅地完成此操作 🚀
```php
<?php

// This is okay 😊
if (User::query()->where('id','=', 2)->count() === 0) {
}

// This is good 😊
if (!User::query()->where('id','=', 2)->exists()) {
}

// This is better 😎
if (User::query()->where('id','=', 2)->doesntExist()) {
}
```

#### 克隆您的查询
有时您可能需要重复使用相同的基本查询来进行多次过滤。Laravel 附带了“克隆”方法来执行此操作 🚀
```php
<?php

// Base query, common conditions
$query = User::query()->where('created_at', '<', now()->subMonths(3));

$verified_users = $query->clone()->whereNotNull('email_verified_at')->get();

// This can be customized further if needed
$unverified_users = $query->clone()->whereNull('email_verified_at')->get();
```

#### 动态隐藏列
有时，你可能想要隐藏未在“hidden”数组中定义的模型属性。Laravel 允许你使用“makeHidden”方法动态执行此操作 🚀
```php
<?php

$users = User::all()->makeHidden(['address', 'phone_number']);

$seed = Seeds::query()->where('id','=', 801)->first()->makeHidden(['seed','type'])->toArray();
```

#### “data_get” 助手
使用嵌套数组时，Laravel 提供了一个名为“data_get”的酷助手。此助手允许您使用`.`语法和通配符来检索值；当然也有`data_set()` 🚀
```php
<?php

$data = [
	'product-one' => ['name' => 'Desk 1', 'price' => 100],
	'product-two' => ['name' => 'Desk 2', 'price' => 150],
];

$res1 = data_get($data, 'product-one.name'); 
$res2 = data_get($data, '*.name'); 
dump($res1);				// 'Desk 1';
dump($res2);				// ['Desk 1', 'Desk 2'];

data_set($data,'product-two.price',210.5);
dump(data_get($data, 'product-two.price'));     // 210.5
```

#### 更好地检查输入是否存在
我们经常需要检查请求是否包含某些值。你知道 Laravel 附带了两种很酷的方法“has”和“hasAny”，可以优雅地执行这些检查吗？ 🚀
```php
<?php

// True if ALL of the values are present
if ($request->has(['name', 'email'])) {
    //
}

// True if ANY of the values are present
if ($request->hasAny(['name', 'email'])) {
    //
}
```

#### `Arr::has()`助手方法
我们经常需要检查数组中是否有指定的键，Laravel 的Arr助手类里提供了`has()`的处理方法 🚀
```php
<?php

$data = [
	'product-one' => ['name' => 'Desk 1', 'price' => 100],
	'product-two' => ['name' => 'Desk 2', 'price' => 150],
	'product-third' => null,
];

dump(Arr::has($data, 'product-one'));       // true
dump(Arr::has($data, 'product-one.name'));  // true
dump(Arr::has($data, 'product-third'));     // true
```

#### `latest()`和`oldest()`方法
我们经常使用“orderBy”方法按升序或降序对模型进行排序。但你知道 Laravel 附带两种方法“latest”和“oldest”就是用来做这个的吗？ 🚀
```php
<?php

// Instead of this 🥱
User::query()->orderBy('created_at', 'desc')->get();
User::query()->orderBy('created_at', 'asc')->get();

// Do this 😎
User::query()->latest()->get();
User::query()->oldest()->get();

// You can specify keys other than created_at
User::query()->latest('id')->get();
User::query()->oldest('id')->get();
```

#### Collection
有时候我们需要处理数据数据，可放在Collection里进行处理，因为Laravel为Collection提供了很多处理方法 🚀
```php

$collection = collect(['price' => 100]);

// Check and set value if not exists
if (!$collection->has('name')) {
    $collection->put('name', 'Desk');
}
$value = $collection->get('name');

// Or use getOrPut() for the same operation
$value = $collection->getOrPut('name', 'Desk');
```

#### “times” 方法
您是否知道 Laravel 附带了一个很酷的集合方法“times”，它允许您通过调用闭包 N 次来创建集合？这在处理日期或生成随机字符串时可能会很有用 🚀
```
$collection = Collection::times(10, function (int $number) {
    return $number * 9;
});

$collection->all(); 
// [9, 18, 27, 36, 45, 54, 63, 72, 81, 90]
```

#### 访问父循环变量
有时，在处理嵌套循环时，你可能希望跟踪父级的迭代。Blade 让这一切变得非常简单，因为你可以访问父级循环变量 🚀
```
@foreach ($users as $user)
    @foreach ($user->posts as $post)
        @if ($loop->parent->first)
            // This is the first iteration of the parent loop.
        @endif
    @endforeach
@endforeach
```

#### “forge” Collection方法
有时，在使用集合时，你可能希望通过其键删除元素。幸运的是，集合带有“忘记”方法，可以做到这一点🚀
```
<?php

$collection = collect(['name' => 'John Doe', 'framework' => 'laravel']);

$collection->forget('name');

$collection->all(); // ['framework' => 'laravel']
```

#### “zip” Collection方法
使用集合时，您可能希望按索引合并两个集合，先合并第一个索引的值，然后合并第二个索引的值，依此类推。幸运的是，Laravel 包含“zip”方法来执行此操作🚀
```
<?php

$collection = collect(['Chair', 'Desk']);

// This will merge values by index, so "Chair" with 100, and "Desk" with 200
$zipped = $collection->zip([100, 200]);

$zipped->all(); // [['Chair', 100], ['Desk', 200]]
```

#### “every” Collection方法
有时你可能想检查集合中的每个元素是否都符合条件。幸运的是，Laravel 附带了“every”方法来做到这一点🚀
```
$result1 = collect([1, 2, 3])->every(function (int $value, int $key) { return $value > 2;} );
// $result will be false

$result2 = collect([])->every(function (int $value, int $key){ return $value > 2;});
// Since the collection is empty, $result will be true
dump($result1,$result2);
```

#### “WhenNotEmpty” Collection方法
在使用集合时，您可能希望在集合不为空时执行一些逻辑。Laravel 无需手动检查，它提供了一个很酷的方法“whenNotEmpty()”，可以做到这一点 🚀
```
<?php

$collection = collect(['michael', 'tom']);

$collection->whenNotEmpty(function (Collection $collection) {
    return $collection->push('adam');
});

$collection->all(); // ['michael', 'tom', 'adam']

$collection = collect(); // empty collection

$collection->whenNotEmpty(function (Collection $collection) {
    return $collection->push('adam');
});

$collection->all(); // []
```

#### 搜索Collection内容
你知道 Laravel 允许你搜索集合项吗？你甚至可以传递一个条件来搜索满足该条件的第一个元素 🚀
```
<?php
$collection = collect([2, 4, 6, 8]);

$collection->search('4'); // 1 (the index)

$collection->search('4', strict: true); // false (not found)

$collection->search(function (int $item, int $key){return $item > 5;}); // 2 (the index)
```

#### 检查你的模型自上次检索以来是否发生了变化
您是否知道 Laravel 附带了该isDirty()方法，该方法允许您检查自上次检索模型以来一个或多个属性是否已更改？🚀
```
<?php

use App\Models\User;

$user = User::create([
    'first_name' => 'John',
    'last_name' => 'Doe',
    'age' => 20,
]);

$user->age = 21;

$user->isDirty(); // true
$user->isDirty('age'); // true
$user->isDirty('first_name'); // false
$user->isDirty(['first_name', 'age']); // true
$user->isDirty(['first_name', 'last_name']); // false

$user->save();

$user->isDirty(); // false
```

#### 自定义默认时间戳列
有时，您可能需要自定义默认时间戳列，或者您可能已经有一个正在为其创建模型的旧表。幸运的是，这样做非常简单 🚀
```
<?php

class Flight extends Model
{
    const CREATED_AT = 'creation_date';
    const UPDATED_AT = 'updated_date';
}
```

#### 删除（销毁）记录
您是否知道 Laravel 附带了destroy允许您通过主键删除记录的方法？🚀
```
<?php

// Instead of this 😢
Flight::find(1)->delete()

// Do this 😎
Flight::destroy(1);

Flight::destroy(1, 2, 3); // works with variadic arguments

Flight::destroy([1, 2, 3]); // arrays

Flight::destroy(collect([1, 2, 3])); // and also collections!
```

#### “last”和“head”助手
你知道 Laravel 附带两个助手“last”和“head”吗？它们允许你检索数组的第一个和最后一个元素 🚀
```
<?php

$array = [100, 200, 300];

$first = head($array); // 100

$last = last($array); // 300
```

#### 检查你的应用环境
我们经常需要检查应用程序环境。虽然你可以使用 environment 方法来执行此操作，但 Laravel 附带了优雅的方法“isProduction”和“isLocal”来执行此操作 🚀
```
<?php

// Could be better 😫
app()->environment() === 'production'

// Okay 😐
app()->environment('production')

// Better 😎
app()->isProduction()

// Also applies for 'local' environment with "isLocal()"
```

#### 截断长字符串
有时您可能希望截断较长的描述以便显示。Laravel 附带了“limit”方法来执行此操作，并且在即将推出的版本中，您可以保留整个单词以获得更好的用户体验🚀
```
<?php

use Illuminate\Support\Str;

Str::limit('This will be a long description', 10); // This will ...

Str::limit('This will be a long description', 10, ' ( ... )'); // This will ( ... )
```

#### Blade 的类型提示
我们经常使用 Blade，如果要抱怨一件事，那就是类型提示。不过，我们可以通过为所有使用的变量定义一个 @php 块来解决这个问题 🚀
```
@php
    /* @var App\Models\Flight $flight */
@endphp

<div>
    // Your IDE will provide type hints for the property
    {{ $flight->name }}
</div>
```

#### 优雅地获取 Bearer Tokens
使用 Laravel 构建 API？您可以使用请求对象上的“bearerToken”方法检索 bearer token，而无需手动解析它 🚀
```
<?php

// Instead of this 😞
$token = substr(request()->header('Authorization'), 7);

// Do this 😊
$token = request()->bearerToken();
```

#### 过滤虚假值
我们都曾在集合上使用过“filter”方法，但您是否知道，如果没有传递回调，它将过滤掉所有虚假值？🚀
```
<?php

$collection = collect([1, 2, 3, null, false, '', 0, []]);
$collection->filter()->all(); // [1, 2, 3]
```

#### 更好的join
我们都使用过 PHP 的“implode”函数，但你知道“join”助手吗？它的功能相同，但还允许你自定义最后一个分隔符 🚀
```
<?php

// We've all done this, the regular implode()
collect(['a', 'b', 'c'])->join(', ', ''); // 'a, b, c'

// But did you know you can specify the last separator?
collect(['a', 'b', 'c'])->join(', ', ', and '); // 'a, b, and c'

// And it's smart enough to handle edge cases
collect(['a'])->join(', ', ', and '); // 'a'
collect([])->join(', ', ', and '); // ''
```

#### 在“find”中使用多个 ID 和特定列
我们经常使用“find()”，但你知道你可以传递 ID 数组并选择特定的列吗？🚀
```
<?php
// You can pass an array of ids, an select specific columns
User::find([1, 2], ['email']);
// select `email` from `users` where `users`.`id` in (1, 2)
```

#### 在命令中请求确认
您是否知道，您可以在执行有风险的命令之前请求确认？您可以使用“确认”方法执行此操作🚀
```
<?php

// Displays the old Laravel prompt view
$this->confirm('Do you want to continue?');

// With "components", it displays the modern Laravel prompt view
$this->components->confirm('Do you want to continue?');

// In your terminal, you should see
/*
 * Do you want to continue? (yes/no) [no]
 *
 */
```

#### 更好的 dd()
在调试 Eloquent 查询时，我们经常使用“dd()”来检查结果。你知道你可以直接将其链接起来吗？🚀
```
<?php

// This is okay 😊
$user = User::all();
dd($users);

// This is better 🔥
User::all()->dd();
```

#### 更好的Pluck
我们经常需要获取某些模型的 ID。虽然您可以使用“pluck()”方法来执行此操作，但您也可以使用“modelKeys()”，它读起来更顺畅，并且如果您在任何时候更改主键也不会中断🚀
```
<?php

use App\Models\User;

// Instead of this
$ids = User::all()->pluck('id');

// You can do this 🔥
$ids = User::all()->modelKeys();
```

#### 获取指定日期的年龄
由于 Laravel 在底层使用了 Carbon，因此您可以轻松获取解析日期的年龄 🚀
```
<?php

use Illuminate\Support\Carbon;

// Get the age from a given date
$laravelsAge = Carbon::parse('01-06-2011')->age;

// This also works with date columns
$age = User::first()->birthday->age;
```

#### 获取最近和最远的日期
是否曾经需要获取两个日期中与给定日期最接近或最远的日期？由于 Laravel 在底层使用了 Carbon，因此您可以使用“最近”和“最远”方法来实现这一点 🚀
```
<?php

use Illuminate\Support\Carbon;

$date = Carbon::parse('2024-05-15');
$date1 = Carbon::parse('2024-01-01');
$date2 = Carbon::parse('2024-05-16');

// You can now check the closest or farthest date
$date->closest($date1, $date2); // 2024-05-16
$date->farthest($date1, $date2); // 2024-01-01
```

#### “shortRelativeDiffForHumans”方法
我确信您已经使用“diffForHumans”方法来获取人类可读的日期。但您知道可以使用“shortRelativeDiffForHumans”方法获取更短的版本吗？🚀
```
<?php

now()->subDays(5)->diffForHumans(); // 5 days ago

// Need a shorter version? No problem
now()->subDays(5)->shortRelativeDiffForHumans(); // 5d ago
```

#### “finish”助手
有时，您可能需要确保字符串以特定字符结尾，例如斜杠或点。 Laravel 附带了“finish”助手来执行此操作 🚀
```
<?php

use Illuminate\Support\Str;
 
Str::finish('this/string', '/'); // this/string/

Str::finish('this/string/', '/'); // this/string/
```

#### “hasHeader” 方法
您是否曾经需要检查标头？虽然您可以手动执行此操作，但 Laravel 附带了“hasHeader”方法来执行此操作 🚀
```
<?php
 
if ($request->hasHeader('X-Header-Name')) {
    // ...
}
```

#### `or`与其他条件并行的问题
有时候我们想写一个这样的sql：`select * from my_table where `user_id` = 20 and `birthday` >= 20241212 and (balance>0 or value>0);`

如果用laravel的php代码写成这样：
```php
$res = DB::query()->table('my_table')
    ->where('user_id', $userId)
    ->where('birthday', '>=', $dbirthday)
    ->whereRaw('balance>0 or value>0')
    ->get()
    ->toArray();
```
这是错误的，它转成sql是`select * from my_table where `user_id` = 20 and `birthday` >= 20241212 and balance>0 or value>0;`
那就不能得到正确的结果，其实正确的写法应该是：
```php
$res = DB::query()->table('my_table')
    ->where('user_id', $userId)
    ->where('birthday', '>=', $dbirthday)
    ->where(function ($query) { 
        $query->where('balance', '>', 0)
            ->orWhere('value', '>', 0);
    })
    ->get()
    ->toArray();
```


参考：https://github.com/OussamaMater/Laravel-Tips