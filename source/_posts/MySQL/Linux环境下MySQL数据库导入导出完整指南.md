---
title: Linux环境下MySQL数据库导入导出完整指南
tags:
  - MySQL
  - Linux
categories:
  - MySQL
abbr link: mysql-import-export-guide
abbrlink: b820
date: 2025-02-21 09:23:00
updated: 2025-02-21 09:23:00
---

## 一、数据库导出操作

### 1.1 导出指定数据表
```bash
mysqldump -h [主机地址] -u [用户名] -p[密码] [数据库名] [表名] > /path/to/output_file.sql
```

**参数说明：**
- `-h`：数据库服务器地址（本地可省略）
- `-u`：MySQL用户名
- `-p`：密码（注意-p与密码之间无空格）
- `>`：重定向输出到文件

**安全操作建议：**
```bash
# 推荐方式（密码交互式输入）
mysqldump -h 192.168.1.100 -u root -p mydb users > backup_users.sql
```

### 1.2 导出整个数据库
```bash
mysqldump -h [主机地址] -u [用户名] -p[密码] [数据库名] > /path/to/full_dump.sql
```

**高级导出选项：**
```bash
# 导出并压缩（适用于大数据库）
mysqldump -u root -p mydb | gzip > mydb_backup.sql.gz

# 仅导出表结构
mysqldump -u root -p --no-data mydb > schema_only.sql

# 导出时忽略指定表
mysqldump -u root -p mydb --ignore-table=mydb.logs > exclude_logs.sql
```

## 二、数据库导入操作

### 2.1 基本导入命令
```bash
mysql -h [主机地址] -u [用户名] -p[密码] [数据库名] < /path/to/input_file.sql
```

**典型使用场景：**
```bash
# 导入完整数据库
mysql -u root -p mydb < full_dump.sql

# 导入指定表数据
mysql -u root -p mydb < users_data.sql
```

### 2.2 常见错误处理方案

**错误示例：**
```sql
ERROR 1227 (42000) at line 18: Access denied; you need (at least one of) the SUPER privilege(s) for this operation
```

**解决方案：**
1. 打开SQL文件查找权限相关语句
```bash
vim input_file.sql
```

2. 注释或删除以下类型语句：
```sql
/*!50503 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
SET @@GLOBAL.gtid_purged='...';
```

3. 保存文件后重新导入

**预防措施（导出时添加参数）：**
```bash
mysqldump --set-gtid-purged=OFF -u root -p mydb > clean_dump.sql
```

## 三、高级操作技巧

### 3.1 导出时排除触发器/事件
```bash
# 不导出触发器
mysqldump --skip-triggers -u root -p mydb > no_triggers.sql

# 不导出事件
mysqldump --skip-events -u root -p mydb > no_events.sql
```

### 3.2 分块导出大表
```bash
# 按行数分块导出
mysqldump -u root -p --where="1 LIMIT 0,1000000" mydb big_table > part1.sql
mysqldump -u root -p --where="1 LIMIT 1000000,1000000" mydb big_table > part2.sql
```

### 3.3 导入进度显示
```bash
# 使用pv工具监控进度
pv input_file.sql | mysql -u root -p mydb

# 安装pv：yum install pv 或 apt-get install pv
```

## 四、生产环境注意事项

### 4.1 权限管理规范
| 操作类型       | 所需权限                      |
|----------------|-------------------------------|
| 完整导出       | SELECT, LOCK TABLES           |
| 部分表导出     | SELECT 权限                   |
| 数据库导入     | CREATE, INSERT, ALTER 等      |

### 4.2 版本兼容性处理
```bash
# 导出时指定兼容模式
mysqldump --compatible=ansi -u root -p mydb > compatible.sql

# 跨版本迁移建议流程：
源服务器导出 -> 转换字符集 -> 目标服务器导入验证
```

### 4.3 日志记录与验证
```bash
# 记录导入导出操作日志
{
    echo "[$(date)] 开始导出数据库"
    mysqldump -u root -p mydb > backup.sql
    echo "[$(date)] 导出完成，文件大小: $(du -h backup.sql)"
} >> /var/log/db_ops.log 2>&1

# 验证备份完整性
mysqlcheck -u root -p --check-upgrade mydb
```

## 五、典型问题解决方案

### 5.1 中文乱码问题
**导出时指定字符集：**
```bash
mysqldump -u root -p --default-character-set=utf8mb4 mydb > utf8_backup.sql
```

**导入时设置字符集：**
```bash
mysql -u root -p --default-character-set=utf8mb4 mydb < backup.sql
```

### 5.2 存储引擎不兼容
**转换存储引擎：**
```bash
sed -i 's/ENGINE=MyISAM/ENGINE=InnoDB/g' backup.sql
```

### 5.3 外键约束冲突
**导入时临时禁用外键检查：**
```sql
/* 在SQL文件开头添加 */
SET FOREIGN_KEY_CHECKS=0;

/* 在文件结尾恢复 */
SET FOREIGN_KEY_CHECKS=1;
```

## 六、自动化脚本示例

### 6.1 自动备份脚本
```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/data/backups"
DB_NAME="mydb"
USER="root"

mysqldump -u $USER -p$PASSWORD --single-transaction $DB_NAME | gzip > $BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz

# 保留最近7天备份
find $BACKUP_DIR -name "*.sql.gz" -type f -mtime +7 -delete
```

### 6.2 自动恢复脚本
```bash
#!/bin/bash
INPUT_FILE=$1
DB_NAME="mydb"
USER="root"

# 预处理SQL文件
sed -i '/^SET @@/d' $INPUT_FILE
sed -i '/^CREATE ALGORITHM=/d' $INPUT_FILE

mysql -u $USER -p$PASSWORD $DB_NAME < $INPUT_FILE
```

## 七、最佳实践总结

1. **安全规范**
    - 使用mysql_config_editor存储登录凭证
    - 设置备份文件权限为600
    - 定期测试备份恢复流程

2. **性能优化**
    - 大数据库使用`--single-transaction`参数
    - 启用`--quick`模式加速导出
    - 并行导出多个表：`mydumper`工具

3. **监控指标**
   ```bash
   # 监控备份文件大小变化
   watch -n 3600 'du -h /backups | tail -n1'

   # 检查最后一次备份时间
   ls -lht /backups | head -n2
   ```

通过掌握这些技巧，我们可以高效安全地管理MySQL数据库的导入导出操作。建议至少每月进行一次完整的备份恢复演练，确保在紧急情况下能快速恢复数据。