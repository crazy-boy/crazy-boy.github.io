# 工具下载维护

## 当前工具与交付约定

工具放在 `source/tools/<id>/`，每个目录包含 EXE、原样复制的 `README.md` 和博客使用说明 `index.md`。默认只复制发布 EXE 和 README，不带源码、构建缓存、测试、用户数据或旧版程序；以用户当前指定范围为准。

已接入来源（更新前核对目录和版本是否仍适用）：

| ID | EXE 来源 | README 来源 |
| --- | --- | --- |
| diff-tool | `D:/github/learning-notes/tools/diff_tool/diff_tool.exe` | 同目录 `README.md` |
| morrow | `D:/github/learning-notes/tools/morrow/dist-native/Morrow.exe` | `D:/github/learning-notes/tools/morrow/README.md` |

旧的 `sql-diff`、`json-diff` 独立工具已被用户要求移除，不再从来源目录的 `legacy/` 导入。

## 接入与更新

- `source/_data/download_tools.json` 驱动列表和详情模板。每项包含 `id`、`name`、`label`、`summary`、`filename`、`features`（字符串数组）、`bytes`（实际字节数）、`size`（显示大小）、`sha256`（小写）、`url`、`download`、`readme`。
- 链接使用站内绝对路径，例如 `/tools/morrow/`、`/tools/morrow/Morrow.exe`、`/tools/morrow/README.md`。
- 更新 EXE 后重新计算大小和 SHA-256，不能沿用旧元数据；复制后核对源文件与目标文件哈希一致。
- `index.md` 的 frontmatter 使用 `layout: tool-guide`、`tool_id: <id>`、`comments: false` 和标题。`tool_id` 必须匹配目录数据，否则模板无法找到工具。
- 入口为 `source/tools/index.md`，模板为 `themes/itsneko/layout/tools.ejs` 和 `tool-guide.ejs`，样式为 `themes/itsneko/source/css/tools.css`。
- `_config.yml` 中 `tools/**/*.exe`、`tools/**/README.md` 必须在 `skip_render`，确保下载原样输出。不要跳过整个 `tools/**`，否则使用说明页不会渲染。
- 网页说明根据实际 README 提炼使用步骤；原始 README 保持不变。涉及源码的开发或 CLI 命令应说明下载包不含源码。

## 验证

运行构建；删除旧工具时先 clean。核对 `public/tools/index.html` 和每项详情页存在、入口和下载链接有效、构建后的 EXE / README 与源文件逐字节一致、元数据大小和 SHA-256 正确。移除工具还需确认旧页面和旧下载不再出现在构建产物中。

删除前核实目标绝对路径位于本仓库内，仅删除指定工具目录，不修改外部来源。完成后用 git diff / status 确认交付范围。
