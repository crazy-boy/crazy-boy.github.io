---
title: MongoDB笔记
tags: [MongoDB]
categories: MongoDB
abbrlink: 'mongodb-notes'
date: 2021-12-31 14:48:49
updated: 2021-12-31 14:48:49
---

### 常用脚本
1. 修改字段名
```sql
db.getCollection('集合名').update({}, {$rename: {"修改前字段名1": "修改后字段名1", "修改前字段名2": "修改后字段名2"...}}, {multi:true})
```
 `{multi:true}`表示 对该集合的所有数据生效

2. 新增字段
```sql
db.getCollection('集合名').update({}, {$set: {"字段名1": "", "字段名2": ""...}}, {multi:true})
```
 `{multi:true}`表示 对该集合的所有数据生效

3. 更新某个字段的值，使其与另一个字段的值相同
```sql
db.getCollection('集合名').find().forEach(
	function(item){
		db.getCollection('集合名').update({"_id":item._id}, {"$set":{"字段名A":item.字段名B}}, {})
	}
)
```

4. 创建集合
```sql
db.createCollection("集合名");
```


5. 创建索引
```sql
db.getCollection("集合名").createIndex({
    "字段名": NumberInt("1"),
    "字段名": NumberInt("-1"),
	……
    "字段名": NumberInt("1")
}, {
    name: "索引名"
});
```
1：升序，-1：降序


6. 插入数据
```sql
db.getCollection("集合名").insert({
	"字段1": 值1,
	"字段2": 值2,
	……
    "字段n": 值n
});
```