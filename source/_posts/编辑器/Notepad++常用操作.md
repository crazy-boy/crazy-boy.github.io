---
title: Notepad++常用操作
tags: [Notepad++]
categories: [其他]
abbrlink: 'notepad++-notes'
date: 2020-08-29 10:11:15
updated: 2024-08-29 10:11:15
---

### 1. 将指定字符替换为换行
 - 方法一  
  查找目标：待替换的字符
  替换为：\r
  查找模式：扩展
  如把 | 替换为换行
  ![](/images/notepad_note_1.png)
  ![](/images/notepad_note_2.png)
 - 方法二  
   1. 打开 需要修改的文本文件。
   2. 按下 Ctrl+H 组合键，打开“替换”对话框。
   3. 查找目标： 在“查找目标”输入框中输入要替换的内容的正则表达式。
   4. 替换为： 在“替换为”输入框中输入 \n，表示换行符。
   5. 选择模式： 在“查找模式”中，确保选中了“正则表达式”选项。
   6. 点击“全部替换” 按钮。
   ![](/images/notepad_note_1.2.png)

### 2. 去除重复的行
- 选择内容，然后点击 编辑->行操作->升(降)序排列文本行
![](/images/notepad_note_3.png)
- 选择内容，然后点击 编辑->行操作->删除连续的重复行
![](/images/notepad_note_4.png)
- 得到去重后的内容，唯一缺点是打乱了原有内容的顺序
![](/images/notepad_note_5.png)