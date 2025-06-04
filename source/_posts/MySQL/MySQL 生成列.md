---
title: MySQL 生成列
tags: [MySQL,生成列]
categories: [MySQL]
abbrlink: 'generated-columns'
date: 2025-04-24 14:09:20
updated: 2025-04-24 14:09:20
---

MySQL 生成列（Generated Column），也称为虚拟列，是一种特殊类型的列，其值由其他列的值通过表达式计算得出，而不是直接存储在表中。

### 基本概念

生成列分为两种类型：
1. 虚拟列（VIRTUAL）：值在查询时动态计算，不占用存储空间
2. 存储列（STORED）：值在插入或更新时计算并存储，占用存储空间

### 特点

1. 表达式支持：可以使用大多数MySQL表达式，包括算术运算、函数调用、CASE表达式等
2. 约束：虚拟列可以有NOT NULL约束，但不能有DEFAULT或AUTO_INCREMENT约束
3. 索引：存储列可以建立索引，虚拟列也可以（MySQL 5.7.6+）
4. 外键：不能作为外键引用

### 使用场景

1. 简化查询：避免在查询中重复计算
2. 数据一致性：确保派生值始终与源数据一致
3. 性能优化：对存储列建立索引可以提高查询性能

### 创建生成列

```sql
CREATE TABLE employees (
    id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    full_name VARCHAR(100) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) VIRTUAL,
    salary DECIMAL(10,2),
    annual_salary DECIMAL(10,2) GENERATED ALWAYS AS (salary * 12) STORED
);
```

### 修改生成列

```sql
ALTER TABLE employees 
MODIFY COLUMN full_name VARCHAR(100) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name, ' (Employee)')) VIRTUAL;
```

### 删除生成列

```sql
ALTER TABLE employees DROP COLUMN full_name;
```

### 注意事项

• 虚拟列不能引用其他虚拟列

• 在MySQL 5.7中，只有存储列可以有索引

• 在MySQL 8.0中，虚拟列也可以有索引

• 虚拟列的值在查询时计算，可能影响性能（特别是复杂表达式）

### PHP laravel中如何查找指定表中的生成列

```php
	/**
     * 获取指定表的生成列
     * @param string $tableName
     * @return array
     */
    public static function getGeneratedColumns(string $tableName): array
    {
        $database = env("DB_DATABASE");
        $cacheKey = "db_generated_columns_{$database}_{$tableName}";
        return RedisService::cacheObject($cacheKey, [], function () use ($tableName, $database) {
            try {
                return DB::table('information_schema.COLUMNS')
                    ->where('TABLE_SCHEMA', $database)
                    ->where('TABLE_NAME', $tableName)
                    ->whereIn('EXTRA', [
                        'VIRTUAL GENERATED',
                        'STORED GENERATED',
                        'auto_increment',     // 自增列
                        'DEFAULT_GENERATED',
                        'DEFAULT_GENERATED on update CURRENT_TIMESTAMP',    // 时间戳列
                        'on update CURRENT_TIMESTAMP'     // 时间戳列
                    ])
                    ->select('COLUMN_NAME')
                    ->pluck('COLUMN_NAME')
                    ->toArray();
            } catch (\Throwable $e) {
                Log::error("Failed to get generated columns for table {$tableName} in database {$database}: " . $e->getMessage());
                return [];
            }
        });
    }
```

### 说明
虚拟列的内容不能修改，如果直接修改会报错，提示`The value specified for generated column 'sc_gmv' in table 'sc_storage_game' is not allowed.`。

### 总结
MySQL 生成列为数据库设计提供了强大的功能，可以简化应用逻辑、提高数据一致性并优化查询性能。在 Laravel 中，通过封装服务类并结合缓存机制，可以高效地管理和使用生成列。开发者应根据具体业务场景选择虚拟列或存储列，并注意相关限制和最佳实践。

通过合理使用生成列，可以显著提升数据库设计的灵活性和性能，同时保持代码的简洁性和可维护性。
