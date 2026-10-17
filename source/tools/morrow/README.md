# Morrow

轻量级 Windows 任务管理工具。日常使用的是原生 WinForms 版，源码位于 `native/`，无需 Node.js 或 Python 运行时。

## 使用

- 主界面是 460×420 的快捷面板。默认显示快捷键为 `Ctrl+Shift+M`，再次按键、按 Esc、点击面板空白处或切换到其他窗口即可隐藏；隐藏后仍留在系统托盘。
- 在顶部输入内容并按回车可快速添加，截止时间采用设置中的默认值。点击右侧的加号图标可打开独立窗口填写内容和截止时间。
- 勾选任务即标记为已完成；双击或选中后点底部的铅笔图标可修改；右键或选中后点底部的垃圾桶图标可删除。可按“全部任务 / 今天到期 / 已延期 / 已完成”筛选，搜索框会即时过滤。
- 顶部的齿轮图标打开独立设置窗口，可调整快捷键、默认截止时间和周期提醒；点“选择工具与识别规则”分别启用飞书、企业微信、钉钉、微信、QQ。设置中的“取消”会返回主面板并放弃本次修改；办公工具规则点“确定”后，仍需在主设置点“保存”才会生效。将鼠标停在图标上可查看名称。

办公工具识别默认关闭。启用后每 3 秒只检查已选工具的前台聊天窗口，首次打开聊天仅建立基线；识别到任务关键词，或同时包含 @ 我的称呼和常见任务动作时，会在主面板显示“待确认”，点击“加入任务”后才写入任务列表，也可点击“忽略”。候选和忽略结果会保存，避免重复提示。多个称呼用逗号或顿号分隔（如“张三、三哥”），并视为同一人，默认称呼为“张三”。各工具只配置窗口进程与聊天区域，界面布局、缩放和 Windows 中文 OCR 组件会影响识别效果。

## 构建和测试

在项目目录运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File build-native.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tests\run-native-tests.ps1
```

构建结果为 `dist-native\Morrow.exe`，应用图标会同时显示在 exe、窗口和系统托盘中。重新构建前需关闭正在运行的旧版 exe。

## 数据与源码

任务保存在当前 Windows 用户的 `%APPDATA%\TodoTool\data.json`。保存时使用临时文件并保留上一版 `data.json.bak`；读取失败时会提示错误并保留原文件。

- `native/Program.cs`：启动和单实例处理
- `native/MainForm.cs`：快捷面板与独立弹窗
- `native/UiIcons.cs`：界面按钮图标
- `native/Storage.cs`：数据存取
- `native/Office/`：共用 OCR、候选识别与各工具独立的来源配置
- `assets/Morrow.svg`、`assets/Morrow.ico`：可编辑的图标源文件与 exe 图标
- `tests/`：原生存储及飞书判断测试