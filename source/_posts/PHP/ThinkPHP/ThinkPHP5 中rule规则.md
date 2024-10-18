---
title: ThinkPHP5 中rule规则
tags: [ThinkPHP]
categories: [PHP]
abbrlink: 'thinkphp-rule'
date: 2022-05-31 21:49:19
updated: 2022-05-31 21:49:19
---

rule规则
``` 
class Item extends \think\Validate{
	protected $rule = [
		['mobile|手机号', 'require|length:11', '手机号必填|手机号格式不正确'],
		…
	];

	protected $scene = [
		'add'=>['mobile','name'…],
		…
	];
	
}

``` 

添加自定义校验
``` 
$rule = [
	['anchor_id|关联账号', 'require|checkAnchor'],
];

protected function checkAnchor($value){
	…
	if ($error = $server->getError()) {
		extract($error);
		/**
		 * @var $msg
		 */
		return $msg;
	}
	return true;
}
``` 
