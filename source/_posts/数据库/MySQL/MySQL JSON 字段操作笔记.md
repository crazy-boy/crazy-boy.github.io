---
title: MySQL JSON 字段操作笔记
tags: [JSON]
categories: MySQL
abbrlink: 'mysql-json-notes'
date: 2026-09-18 15:00:00
updated: 2026-09-18 15:00:00
---


## 一、常用操作符与函数

| 操作符/函数 | 说明 | 示例 |
|------------|------|------|
| `->` | 提取 JSON 值，返回 JSON 类型 | `config->'$.conf_id'` |
| `->>` | 提取 JSON 值，返回文本类型 | `config->>'$.conf_id'` |
| `JSON_EXTRACT()` | 提取 JSON 值，等价于 `->` | `JSON_EXTRACT(config, '$.conf_id')` |
| `JSON_UNQUOTE()` | 去掉 JSON 字符串的引号 | `JSON_UNQUOTE(JSON_EXTRACT(...))` |
| `JSON_SET()` | 设置/新增 key，已有则覆盖 | `JSON_SET(extra, '$.a', 1)` |
| `JSON_REPLACE()` | 仅替换已存在的 key | `JSON_REPLACE(extra, '$.a', 1)` |
| `JSON_REMOVE()` | 删除指定 key | `JSON_REMOVE(extra, '$.entry_fee')` |
| `JSON_CONTAINS_PATH()` | 判断 key 是否存在 | `JSON_CONTAINS_PATH(extra, 'one', '$.init_rank')` |
| `JSON_LENGTH()` | 获取 JSON 数组/对象长度 | `JSON_LENGTH(pay_details)` |

---

## 二、查询 JSON 字段中指定 key 的值

### 1. 使用 `->` 或 `->>`
```sql
-- 查询 config 中 conf_id = 5 的记录
SELECT * FROM match_rules WHERE config->'$.conf_id' = 5;

-- 更推荐：提取为文本再比较
SELECT * FROM match_rules WHERE config->>'$.conf_id' = '5';

-- 等价写法
SELECT * FROM match_rules WHERE JSON_EXTRACT(config, '$.conf_id') = 5;
```

### 2. 判断 key 是否存在
```sql
-- 如果 extra 中有 init_rank 这个 key
SELECT * FROM z_match_202311 WHERE extra->'$.init_rank' IS NOT NULL;

-- 更严谨的写法
SELECT * FROM z_match_202311 
WHERE JSON_CONTAINS_PATH(extra, 'one', '$.init_rank');
```

---

## 三、更新 JSON 字段

### 1. 整体替换 JSON 字段
```sql
UPDATE match_rules 
SET prize = '{"sum":{"money":4.3},"ranks":[{"money":2.3},{"money":1.3},{"money":0.7}]}'
WHERE config->'$.conf_id' = 5;
```
> 注意：字符串中的双引号根据客户端可能需要转义，标准 SQL 中直接写 JSON 字符串即可。

### 2. 修改 JSON 中某个 key 的值
```sql
-- 设置/覆盖某个 key
UPDATE table_name 
SET extra = JSON_SET(extra, '$.key', 'value')
WHERE id = 1;

-- 只替换已存在的 key（不存在则不新增）
UPDATE table_name 
SET extra = JSON_REPLACE(extra, '$.key', 'value')
WHERE id = 1;
```

### 3. 用 JSON 数组长度更新普通字段
```sql
UPDATE user_pay_refund_statistics 
SET pay_count = JSON_LENGTH(pay_details);
```
> 注意：没有 `WHERE` 会更新全表，生产环境务必先加条件或备份。

---

## 四、删除 JSON 字段中的指定 key

### 1. 使用 `JSON_REMOVE()`
```sql
-- 删除 extra 中的 entry_fee 字段，仅当 init_rank 存在时
UPDATE z_match_202311 
SET extra = JSON_REMOVE(extra, '$.entry_fee')
WHERE extra->'$.init_rank' IS NOT NULL;
```

### 2. 删除整个记录（基于 JSON 条件）
```sql
DELETE FROM match_rules WHERE config->'$.conf_id' = 92;
```

---

## 五、实际 SQL 示例汇总

```sql
-- 1. 查询 conf_id = 5 的匹配规则
SELECT * FROM match_rules WHERE config->'$.conf_id' = 5;

-- 2. 更新 conf_id = 5 的 prize 字段
UPDATE match_rules 
SET prize = '{"sum":{"money":4.3},"ranks":[{"money":2.3},{"money":1.3},{"money":0.7}]}'
WHERE config->'$.conf_id' = 5;

-- 3. 用 pay_details 数组长度更新 pay_count
UPDATE user_pay_refund_statistics 
SET pay_count = JSON_LENGTH(pay_details);

-- 4. 删除 conf_id = 92 的匹配规则
DELETE FROM match_rules WHERE config->'$.conf_id' = 92;

-- 5. 删除 z_match_202311 中 extra 的 entry_fee 字段（仅当有 init_rank 时）
UPDATE z_match_202311 
SET extra = JSON_REMOVE(extra, '$.entry_fee')
WHERE extra->'$.init_rank' IS NOT NULL;
```

---

## 六、注意事项

1. **`->` 与 `->>` 的区别**
    - `->` 返回 JSON 类型，比较时可能受类型影响。
    - `->>` 返回文本，适合与字符串比较。

2. **JSON_REMOVE 不报错**  
   如果 key 不存在，`JSON_REMOVE` 不会报错，原样返回。

3. **更新整个 JSON 字段**  
   要确保写入的是合法 JSON，否则会报错。

4. **生产环境先备份**  
   执行 `UPDATE`、`DELETE` 前，先用 `SELECT` 验证条件，并备份数据。

5. **性能**  
   JSON 字段查询无法使用普通索引，大数据量时建议将关键字段抽成独立列并建索引。

6. **JSON 函数版本要求**  
   MySQL 5.7+ 支持 JSON 函数；`JSON_CONTAINS_PATH` 等需 5.7+；`->>` 需 5.7.13+。