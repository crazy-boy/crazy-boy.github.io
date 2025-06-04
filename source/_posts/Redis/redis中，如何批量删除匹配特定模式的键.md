---
title: redis中，如何批量删除匹配特定模式的键
tags:
  - Redis
categories:
  - Redis
abbr link: redis-batch-delete-keys
abbrlink: be86
date: 2025-01-26 09:23:00
updated: 2025-01-26 09:23:00
---

在 `redis-cli` 中，我们可以使用批量删除命令来删除匹配特定模式的键。以下是步骤：

1. 使用 `KEYS` 命令找到要删除的键。
2. 使用 `xargs` 和 `DEL` 命令批量删除这些键。

以下是完整的命令：

```sh
redis-cli --scan --pattern "monitor_log*" | xargs redis-cli del
或者
redis-cli -h xxx.com -p 6379 -n 0 --scan --pattern "monitor_log*" | xargs redis-cli -h xxx.com -p 6379 -n 0 del
```

### 解释

1. `redis-cli --scan --pattern "monitor_log*"`：使用 `--scan` 选项和 `--pattern` 选项查找匹配 `monitor_log*` 模式的所有键。这比 `KEYS` 命令更高效，因为 `SCAN` 命令不会阻塞 Redis 服务器。
2. `xargs redis-cli del`：使用 `xargs` 将找到的键传递给 `redis-cli del` 命令，以批量删除这些键。

### 注意

- `SCAN` 命令用于大数据集，因为它可以增量地查找键，而不会阻塞 Redis 服务器。
- `xargs` 命令将输入逐行传递给 `redis-cli del` 命令，确保所有匹配的键都被删除。

### 示例

假设你有以下键：

```
monitor_log1
monitor_log2
monitor_log3
```

运行上述命令将删除所有这些键。

### 执行前确认

为了确保没有误删关键数据，建议首先运行以下命令查看将要删除的键：

```sh
redis-cli --scan --pattern "monitor_log*"
```

确认输出无误后，再运行批量删除命令：

```sh
redis-cli --scan --pattern "monitor_log*" | xargs redis-cli del
```

通过这些步骤，我们可以快速且安全地删除 Redis 中匹配特定模式的键。