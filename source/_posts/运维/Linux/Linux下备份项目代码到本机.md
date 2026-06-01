---
title: Linux下备份项目代码到本机
tags: [备份]
categories: Linux
abbrlink: 'linux-backup-code'
date: 2025-12-26 13:47:25
updated: 2025-12-26 13:47:25
---
项目关停前，需要备份项目代码到本地电脑。下面以php Laravel项目为例，介绍如何备份代码并下载到本地。
首先分析一下哪些文件需要排除：

## 📁 **目录结构分析**
```
/var/www/web/
├── app/              # 应用代码（需要备份）
├── artisan          # Laravel命令行工具（需要备份）
├── blank            # 未知用途，建议排除
├── bootstrap/       # 框架启动文件（需要备份）
├── composer.json    # 依赖配置文件（需要备份）
├── composer.phar    # Composer可执行文件（可以排除，可以重新下载）
├── config/          # 配置文件（需要备份）
├── database/        # 数据库迁移和种子（需要备份）
├── data.sql         # 数据库数据（建议单独备份）
├── public/          # 公开文件（需要备份）
├── README.md        # 说明文档（需要备份）
├── resources/       # 前端资源（需要备份）
├── routes/          # 路由文件（需要备份）
├── start_card       # 未知文件，建议排除
├── storage/         # 存储目录（部分需要备份，部分排除）
├── tests/           # 测试文件（可以排除）
├── vendor/          # Composer依赖（应该排除，可以重新安装）
└── VueBackend文档.md # 文档（需要备份）
```

## 🚀 **快速备份命令**

### **方案1：一键备份（推荐）**
```bash
cd /var/www/web

# 创建压缩包，排除不需要的文件
tar -czvf web_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
  --exclude=vendor \
  --exclude=storage/logs \
  --exclude=storage/framework/cache \
  --exclude=storage/framework/sessions \
  --exclude=storage/framework/views \
  --exclude=storage/framework/testing \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.env \
  --exclude=blank \
  --exclude=start_card \
  --exclude=tests \
  --exclude=composer.phar \
  --exclude=*.log \
  --exclude=*.tmp \
  --exclude=*.cache \
  --exclude=*.sqlite \
  .
```

### **方案2：使用排除文件列表**
```bash
cd /var/www/web

# 创建排除文件列表
cat > exclude_list.txt << 'EOF'
vendor/
storage/logs/
storage/framework/cache/
storage/framework/sessions/
storage/framework/views/
storage/framework/testing/
node_modules/
.git/
.env
blank/
start_card/
tests/
composer.phar
*.log
*.tmp
*.cache
*.sqlite
EOF

# 使用排除列表压缩
tar -czvf web_backup_$(date +%Y%m%d_%H%M%S).tar.gz --exclude-from=exclude_list.txt .

# 删除排除文件列表
rm exclude_list.txt
```

### **方案3：智能备份（区分不同内容）**
```bash
cd /var/www/web

# 先备份代码文件
tar -czvf code_backup_$(date +%Y%m%d).tar.gz \
  app/ artisan bootstrap/ composer.json config/ \
  database/ public/ README.md resources/ routes/ \
  VueBackend文档.md

# 如果需要，单独备份storage中的必要文件（如上传的文件）
if [ -d "storage/app/public" ]; then
    tar -czvf uploads_backup_$(date +%Y%m%d).tar.gz storage/app/public/
fi

# 如果需要，单独备份data.sql
if [ -f "data.sql" ]; then
    cp data.sql data_backup_$(date +%Y%m%d).sql
fi
```

## 📦 **推荐的完整备份脚本**

创建一个 `backup_web.sh` 脚本：

```bash
#!/bin/bash
# backup_web.sh - 备份web目录脚本

BACKUP_DIR="/backup/web"
PROJECT_DIR="/var/www/web"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/web_backup_$TIMESTAMP.tar.gz"
EXCLUDE_FILE="/tmp/web_exclude_$TIMESTAMP.txt"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 创建排除文件列表
cat > $EXCLUDE_FILE << 'EOF'
# 依赖目录（可重新生成）
vendor/
node_modules/

# 缓存和日志文件
storage/logs/
storage/framework/cache/
storage/framework/sessions/
storage/framework/views/
storage/framework/testing/

# 版本控制和敏感文件
.git/
.env
.env.example

# 测试和临时文件
tests/
blank/
start_card/

# 可执行文件（可重新下载）
composer.phar

# 临时文件
*.log
*.tmp
*.cache
*.sqlite
*.swp
*~
EOF

echo "=== 开始备份 /var/www/web ==="
echo "备份时间: $(date)"
echo "排除文件列表:"
cat $EXCLUDE_FILE | grep -v "^#" | grep -v "^$"

echo ""
echo "正在压缩..."
cd $PROJECT_DIR
tar -czf $BACKUP_FILE --exclude-from=$EXCLUDE_FILE .

# 计算备份大小
BACKUP_SIZE=$(du -h $BACKUP_FILE | cut -f1)
FILE_COUNT=$(tar -tzf $BACKUP_FILE 2>/dev/null | wc -l)

echo ""
echo "=== 备份完成 ==="
echo "备份文件: $BACKUP_FILE"
echo "文件大小: $BACKUP_SIZE"
echo "包含文件数: $FILE_COUNT"
echo "MD5校验码: $(md5sum $BACKUP_FILE | cut -d' ' -f1)"

# 清理排除文件
rm $EXCLUDE_FILE

# 清理旧备份（保留最近7天）
find $BACKUP_DIR -name "web_backup_*.tar.gz" -mtime +7 -delete

echo ""
echo "备份文件列表:"
ls -lh $BACKUP_DIR/web_backup_*.tar.gz 2>/dev/null || echo "暂无备份文件"

echo ""
echo "使用以下命令下载到本地:"
echo "  sz $BACKUP_FILE"
echo "或"
echo "  scp $(hostname):$BACKUP_FILE ~/Downloads/"
```

给脚本执行权限并运行：
```bash
chmod +x backup_web.sh
sudo ./backup_web.sh
```

## 📥 **下载到本地**

### **方法1：使用sz下载**
```bash
# 找到最新的备份文件
cd /backup/web
LATEST_BACKUP=$(ls -t web_backup_*.tar.gz | head -1)

# 下载到本地
sz $LATEST_BACKUP
```

### **方法2：使用scp下载（从本地终端执行）**
```bash
# 在本地电脑的终端执行，不是在服务器！
scp username@your_server_ip:/backup/web/web_backup_*.tar.gz ~/Downloads/

# 或下载最新文件
scp username@your_server_ip:/backup/web/$(ssh username@your_server_ip "ls -t /backup/web/web_backup_*.tar.gz | head -1") ~/Downloads/
```

### **方法3：使用rsync（支持断点续传）**
```bash
# 在本地电脑的终端执行
rsync -avz --progress username@your_server_ip:/backup/web/web_backup_*.tar.gz ~/Downloads/
```

## 🔍 **验证备份内容**

### **检查备份文件内容**
```bash
# 查看备份文件中包含的文件列表
tar -tzvf /backup/web/web_backup_20241111_143022.tar.gz | head -20

# 查看总文件数
tar -tzf /backup/web/web_backup_20241111_143022.tar.gz | wc -l

# 检查特定文件是否在备份中
tar -tzf /backup/web/web_backup_20241111_143022.tar.gz | grep "app/Http/Controllers"

# 验证备份完整性
tar -tzvf /backup/web/web_backup_20241111_143022.tar.gz > /dev/null && echo "备份文件完整"
```

## ⚡ **最简快速备份命令**

如果你只想快速备份并下载，使用这个单行命令：

```bash
cd /var/www/web && tar -czvf ~/web_backup_$(date +%Y%m%d).tar.gz --exclude=vendor --exclude=storage/logs --exclude=storage/framework/cache --exclude=blank --exclude=start_card --exclude=tests --exclude=composer.phar --exclude=*.log . && sz ~/web_backup_*.tar.gz
```

## 📊 **备份策略建议**

### **按重要性分级备份**
```bash
# 1. 核心代码备份（最紧急）
tar -czvf core_code.tar.gz app/ bootstrap/ config/ database/ routes/ artisan composer.json

# 2. 前端资源备份
tar -czvf frontend_resources.tar.gz public/ resources/ VueBackend文档.md README.md

# 3. 数据库备份（如果有）
if [ -f "data.sql" ]; then
    gzip -c data.sql > data_$(date +%Y%m%d).sql.gz
fi

# 4. 上传文件备份（如果有）
if [ -d "storage/app/public" ]; then
    tar -czvf uploads.tar.gz storage/app/public/
fi
```

### **排除规则说明**
| 排除项 | 理由 | 是否必须排除 |
|--------|------|-------------|
| `vendor/` | 可通过 `composer install` 重新生成 | ✅ 强烈建议 |
| `node_modules/` | 可通过 `npm install` 重新生成 | ✅ 强烈建议 |
| `storage/logs/` | 日志文件，无需备份 | ✅ 建议 |
| `storage/framework/cache/` | 缓存文件，无需备份 | ✅ 建议 |
| `.git/` | 版本控制，可通过git重新拉取 | ✅ 建议 |
| `.env` | 包含敏感配置，不应备份 | ✅ 必须 |
| `blank/` | 根据名称判断可能是空目录或临时文件 | ✅ 建议 |
| `start_card` | 未知文件，可能是临时文件 | ✅ 建议 |
| `tests/` | 测试文件，生产环境不需要 | ⚠️ 可选 |
| `composer.phar` | 可执行文件，可重新下载 | ⚠️ 可选 |
| `*.log` | 日志文件 | ✅ 建议 |

## 🎯 **推荐的最佳实践**

```bash
# 1. 进入目录
cd /var/www/web

# 2. 备份核心文件（最安全）
tar -czvf /tmp/web_essential_$(date +%Y%m%d).tar.gz \
  app/ artisan bootstrap/ composer.json config/ \
  database/ public/ README.md resources/ routes/ \
  VueBackend文档.md

# 3. 备份storage中的必要部分（如果有上传文件）
if [ -d "storage/app" ]; then
    tar -czvf /tmp/storage_essential_$(date +%Y%m%d).tar.gz \
      --exclude="storage/logs" \
      --exclude="storage/framework/cache" \
      --exclude="storage/framework/sessions" \
      --exclude="storage/framework/views" \
      storage/
fi

# 4. 下载到本地
sz /tmp/web_essential_*.tar.gz /tmp/storage_essential_*.tar.gz 2>/dev/null

# 5. 清理临时文件
rm /tmp/web_essential_*.tar.gz /tmp/storage_essential_*.tar.gz 2>/dev/null
```

## ⚠️ **重要提醒**

1. **备份前确认**：确保你有足够的磁盘空间
   ```bash
   df -h /var/www
   ```

2. **测试备份文件**：下载后解压测试
   ```bash
   # 在本地测试
   tar -tzvf ~/Downloads/web_backup_*.tar.gz | head -10
   ```

3. **敏感信息**：确保 `.env` 文件没有被包含
   ```bash
   tar -tzvf web_backup.tar.gz | grep "\.env"
   ```

4. **数据库单独处理**：`data.sql` 应该单独备份，因为它可能很大
   ```bash
   # 如果data.sql很重要且很大
   gzip -c data.sql > data_$(date +%Y%m%d).sql.gz
   sz data_*.sql.gz
   ```

**最简单有效的命令**：
```bash
cd /var/www/web
tar -czvf ~/web_backup.tar.gz --exclude=vendor --exclude=blank --exclude=start_card --exclude=storage/logs --exclude=storage/framework/cache .
sz ~/web_backup.tar.gz
```

这样你会得到一个精简的、不包含依赖和缓存文件的代码备份，可以直接下载到本地。