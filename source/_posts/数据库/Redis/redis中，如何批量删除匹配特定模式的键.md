---
title: redis中，如何批量删除匹配特定模式的键
tags: [Redis]
categories: [Redis]
abbrlink: redis-batch-delete-keys
date: 2025-01-26 09:23:00
updated: 2025-01-26 09:23:00
---

在 `redis-cli` 中，我们可以使用批量删除命令来删除匹配特定模式的键(本文以` KEYS "*monitor_log*"`为例)。

在 Redis CLI 中删除所有包含 `monitor_log` 的 key，有几种方法：

## 方法1：使用 KEYS 和 xargs（适合 key 数量不多的情况）

```bash
redis-cli -h "$REDIS_HOST" -n 1 KEYS "*monitor_log*" | xargs redis-cli -h "$REDIS_HOST" -n 1 DEL
```

## 方法2：使用 SCAN 和 xargs（推荐用于生产环境）

```bash
redis-cli -h "$REDIS_HOST" -n 1 --scan --pattern "*monitor_log*" | xargs redis-cli -h "$REDIS_HOST" -n 1 DEL
```

## 方法3：使用循环逐条删除（最安全）

```bash
redis-cli -h "$REDIS_HOST" -n 1 --scan --pattern "*monitor_log*" | while read key; do
  echo "Deleting: $key"
  redis-cli -h "$REDIS_HOST" -n 1 DEL "$key"
done
```

## 方法4：在 Lua 脚本中执行（原子操作）

```bash
redis-cli -h "$REDIS_HOST" -n 1 --eval - <<EOF
local keys = redis.call('KEYS', 'monitor_log:*')
for i, key in ipairs(keys) do
  redis.call('DEL', key)
end
return #keys .. ' keys deleted'
EOF
```

## 方法5：先查看再删除（推荐用于确认）

```bash
# 先查看有哪些 key
echo "将要删除的 key:"
redis-cli -h "$REDIS_HOST" -n 1 --scan --pattern "*monitor_log*"

# 确认删除
read -p "确认删除以上所有 key？(y/N): " confirm
if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
  redis-cli -h "$REDIS_HOST" -n 1 --scan --pattern "*monitor_log*" | xargs redis-cli -h "$REDIS_HOST" -n 1 DEL
  echo "删除完成"
else
  echo "取消删除"
fi
```

## 方法6：在 Shell 脚本中添加清理函数

你也可以在现有的 shell 脚本中添加清理函数：

```bash
# 清理所有 monitor_log 相关的 key
cleanup_all_monitor_logs() {
    echo "清理所有 monitor_log 相关的 key..."
    
    local count=0
    redis-cli -h "$redis_host" -n "$redis_db" --scan --pattern "*monitor_log*" | while read key; do
        if [ -n "$key" ]; then
            redis-cli -h "$redis_host" -n "$redis_db" DEL "$key" >/dev/null 2>&1
            echo "已删除: $key"
            count=$((count + 1))
        fi
    done
    
    echo "共删除 $count 个 key"
}

# 清理指定日期的 monitor_log key
cleanup_monitor_logs_by_date() {
    local target_date="$1"
    echo "清理 $target_date 的 monitor_log key..."
    
    local count=0
    redis-cli -h "$redis_host" -n "$redis_db" --scan --pattern "monitor_log:${target_date}:*" | while read key; do
        if [ -n "$key" ]; then
            redis-cli -h "$redis_host" -n "$redis_db" DEL "$key" >/dev/null 2>&1
            echo "已删除: $key"
            count=$((count + 1))
        fi
    done
    
    echo "共删除 $count 个 key"
}

# 使用示例：
# cleanup_all_monitor_logs
# cleanup_monitor_logs_by_date "2025-10-17"
```

## 注意事项：

1. **生产环境谨慎操作**：删除操作是不可逆的，建议先备份或确认要删除的 key
2. **大量 key 的性能**：如果 key 数量很大，使用方法2（SCAN）比方法1（KEYS）更好，因为 KEYS 会阻塞 Redis
3. **权限**：确保 Redis 用户有删除权限
4. **数据库选择**：`-n 1` 指定了数据库1，请根据实际情况调整

## 推荐使用方法：

对于生产环境，推荐使用**方法2**或**方法5**：

```bash
# 最常用的方法
redis-cli -h "$REDIS_HOST" -n 1 --scan --pattern "*monitor_log*" | xargs redis-cli -h "$REDIS_HOST" -n 1 DEL

# 或者带确认的版本
redis-cli -h "$REDIS_HOST" -n 1 --scan --pattern "*monitor_log*" | tee /tmp/monitor_log_keys.txt
read -p "确认删除以上 $(wc -l < /tmp/monitor_log_keys.txt) 个 key？(y/N): " confirm
[ "$confirm" = "y" ] && xargs redis-cli -h "$REDIS_HOST" -n 1 DEL < /tmp/monitor_log_keys.txt
```