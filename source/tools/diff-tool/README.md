# Diff Tool

一个 Windows 桌面工具，包含 SQL、JSON、INI / 键值配置（如 `.properties`、`.env`）和普通文本比对。运行 `diff_tool.exe` 打开统一窗口，顶部标签切换类型。

## 目录

```text
diff_tool/
  app.py               统一入口：GUI 和命令行
  diff_tool.spec        PyInstaller 单文件窗口版配置
  core/
    registry.py         普通比对方式注册表
    models.py           共用差异结果
    json.py             JSON 解析与比对
    config.py           INI / 键值配置解析与比对
    text.py             逐行文本比对
    sql.py              SQL 更新脚本生成
    io.py               文件读取
  gui/
    main_window.py      主窗口与标签页
    compare_page.py     JSON / 配置 / 文本共用页面
    sql_page.py         SQL 专用页面
  tests/                核心行为测试
  legacy/               原 SQL、JSON 独立版本及旧 exe，仅供回溯
```

## 使用

- **SQL**：选择新来源与旧目标，设置方向和排除项，生成目标目录下的 `result.sql`。脚本可能包含 `DROP`、`DELETE`，执行前应核对内容。
- **JSON**：严格值、语义值、原文三种模式；可打开文件或粘贴内容。
- **配置**：格式默认“自动”：带节标题的内容按 INI 解析，`APP_NAME=pixel_bus` 这类纯键值内容按 `.properties` 规则解析；也可以手动选“INI”或“键值配置”。再选“按键”或“原文”。按键模式比较新增、删除和值变化，忽略注释、空白和键顺序；INI 的节名和键名区分大小写，`DEFAULT` 节单独比较。重复节或键会报错。`.properties` 支持 `=`、`:`、空白分隔符、续行及反斜杠转义。
- **文本**：按行比对，包括空格和末尾换行变化。

差异结果页的“差异明细”可展开或收起：JSON 默认展开，配置和文本默认收起；“上一处 / 下一处”在明细收起时仍可使用。

打开文件统一使用 UTF-8（支持 BOM），解码失败会提示。配置、JSON、文本模式只读取输入；输入框内的编辑不会写回原文件。

## 命令行

源码提供命令行；打包的 `diff_tool.exe` 是窗口版，命令行请运行 `app.py`：

```powershell
python app.py sql --source new.sql --target old.sql --out result.sql
python app.py json --left a.json --right b.json --mode semantic
python app.py config --left a.ini --right b.ini
python app.py config --left a.env --right b.env
# 如需强制指定格式，可加 --format ini 或 --format properties
python app.py text --left a.txt --right b.txt
```

JSON / 配置可加 `--mode text` 按原文比对。只读比对的退出码为 `0` 相同、`1` 有差异、`2` 输入或解析错误。SQL 命令成功时退出码为 `0`。

## 开发

```powershell
python -m unittest discover -s tests -v
pyinstaller --noconfirm --clean --distpath . diff_tool.spec
```

新增普通比对方式时，在 `core/` 添加返回 `CompareResult` 的比对函数，并在 `core/registry.py` 注册 `ComparisonProfile`。主窗口、共用结果页和命令行会从注册表创建入口。SQL 会生成文件，保留独立页面和命令行参数。

`legacy/` 保存迁移前的独立程序；当前统一工具从根目录的 `app.py` 和 `diff_tool.spec` 构建。
