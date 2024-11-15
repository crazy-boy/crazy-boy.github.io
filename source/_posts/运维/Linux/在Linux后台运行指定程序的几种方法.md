---
title: 在Linux后台运行指定程序的几种方法
tags: [Linux,后台运行]
categories: [运维]
abbrlink: 'program-run-in-background'
date: 2023-07-15 09:40:25
updated: 2023-07-15 09:40:25
---

<div class="note info">在Linux系统中，将程序在后台运行可以释放终端，让您继续执行其他操作。下面介绍几种常用的方法：</div>

### 1. **直接添加 & 符号**

* **最简单的方法**：在命令末尾加上 `&` 符号，即可将程序放入后台运行。
* **示例**：
  ```bash
  python my_script.py &
  ```
* **注意**：
    - 该方法适用于大多数命令。
    - 退出终端后，后台程序会随之终止。

### 2. **使用 nohup 命令**

* **忽略挂断信号**：`nohup` 命令可以使程序在用户退出终端后继续运行。
* **示例**：
  ```bash
  nohup python my_script.py &
  ```
* **输出重定向**：通常将输出重定向到一个文件中，以避免输出丢失。
  ```bash
  nohup python my_script.py > output.log 2>&1 &
  ```
    - `> output.log` 将标准输出重定向到 `output.log` 文件。
    - `2>&1` 将标准错误重定向到标准输出，即也写入 `output.log` 文件。

### 3. **使用 screen 或 tmux**

* **创建虚拟终端**：screen 和 tmux 可以创建多个虚拟终端，您可以在这些终端中运行程序，即使关闭了原始终端，这些虚拟终端中的程序也会继续运行。
* **示例**：
  ```bash
  screen
  # 在screen中运行程序
  python my_script.py
  # 退出screen但不终止程序
  Ctrl+a d
  ```
* **恢复screen**：
  ```bash
  screen -r
  ```

### 4. **使用 systemd**

* **系统服务管理**：systemd 是 Linux 系统的初始化系统和服务管理器，可以用来管理后台服务。
* **创建服务单元文件**：编写一个 `.service` 文件，定义服务的行为。
* **启动服务**：使用 `systemctl` 命令启动服务。
* **较为复杂**，适合长期运行的服务。

### 5. **使用 jobs 和 bg 命令**

* **将前台进程转为后台**：
    - `Ctrl+Z`：将当前前台进程挂起。
    - `jobs`：查看后台作业。
    - `bg %job_number`：将指定作业放入后台运行。

### **其他注意事项**

* **查看后台进程**：使用 `ps` 命令查看当前正在运行的进程。
* **终止后台进程**：使用 `kill` 命令终止指定进程。
* **日志**：对于长时间运行的程序，建议将输出重定向到日志文件中，以便查看运行情况。

**选择合适的方法**

* **临时任务**：直接添加 `&` 或使用 `jobs` 和 `bg` 命令。
* **长期运行**：使用 `nohup`、`screen`、`tmux` 或 `systemd`。
* **复杂管理**：使用 `systemd`。

**示例：**

假设您有一个 Python 脚本 `my_script.py`，要将其在后台运行，并把输出重定向到 `script.log` 文件。您可以使用以下命令：

```bash
nohup python my_script.py > script.log 2>&1 &
```

**总结**

Linux 提供了多种方法将程序在后台运行，选择哪种方法取决于我们的具体需求和环境。
