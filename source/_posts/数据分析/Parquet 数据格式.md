---
title: Parquet 数据格式
tags: [数据存储]
categories: [数据分析]
abbrlink: 'parquet-data-format'
mathjax: true
date: 2025-10-16 14:40:10
updated: 2025-10-16 14:40:10
---


### 1. Parquet 是什么？

**Apache Parquet** 是一种开源的、**列式存储**的、**为大规模数据分析而设计**的文件格式。

它与我们熟悉的 CSV、JSON 等**行式存储**格式有根本性的不同。让我们通过一个比喻来理解：

*   **行式存储（如 CSV、JSON）**：想象一张表格，存储时是**一行一行地存**。
    ```
    存储顺序： [Alice, 30, NY] -> [Bob, 25, SF] -> [Charlie, 35, NY] -> ...
    ```
    当你想查询“所有人的平均年龄”时，系统必须读取**每一行**的全部数据（包括姓名、年龄、城市），即使你只关心“年龄”这一列。

*   **列式存储（如 Parquet）**：想象一张表格，存储时是**一列一列地存**。
    ```
    存储顺序： [Alice, Bob, Charlie, ...] -> [30, 25, 35, ...] -> [NY, SF, NY, ...]
    ```
    当你想查询“所有人的平均年龄”时，系统可以**只读取“年龄”这一列**的数据，完全跳过姓名和城市列。

**这个根本区别带来了 Parquet 的巨大优势。**

---

### 2. 有什么用途和优势？

Parquet 的设计目标非常明确：**为大数据分析查询提供极高的性能和高效的存储**。

#### 核心优势：

1.  **极高的查询性能**
    *   **列裁剪**： 查询时只读取所需的列，极大地减少了磁盘 I/O。这是最重要的优势。如果一个表有 100 列，你只查询其中的 3 列，Parquet 可以只读取这 3 列的数据，而行式格式需要扫描全部 100 列。
    *   **谓词下推**： Parquet 文件包含**元数据**（如每列的最大值、最小值）。在执行查询 `WHERE age > 30` 时，查询引擎可以先检查这些元数据，直接跳过整个不满足条件的数据块（行组），根本不需要加载它们。
    *   **高效的编码和压缩**： 同一列的数据类型相同，相似性更高，因此可以使用针对特定数据类型优化的编码方案（如字典编码、游程编码），然后再使用通用压缩算法（如 Snappy、GZIP）进行压缩，压缩比非常高。

2.  **存储空间高效**
    *   由于出色的压缩率，Parquet 文件通常比等效的 CSV 或 JSON 文件小得多（通常可以减少 **75% 以上**的存储空间）。这不仅节省了存储成本，也减少了网络传输和磁盘 I/O 的时间。

3.  **支持复杂的嵌套数据结构**
    *   Parquet 原生支持复杂数据类型，如**数组、映射和结构体**。它使用 **Dremel** 的嵌套编码方案，可以高效地将嵌套的 JSON 或 Protocol Buffers 数据展平存储，并在读取时重建。这使得它非常适合存储半结构化数据。

4.  **与大数据生态系统的无缝集成**
    *   Parquet 是 Apache Hadoop 和大数据生态系统的**事实上的标准列式格式**。它被几乎所有主流的数据处理框架原生支持，包括：
        *   **查询引擎**： Apache Spark, Presto/Trino, Apache Hive, Apache Impala
        *   **数据湖/表格式**： Apache Iceberg, Delta Lake, Hudi
        *   **编程语言**： Python (Pandas, PyArrow), Java, R 等

5.  **Schema 演化**
    *   你可以向现有的 Parquet 表中添加新列，而不会破坏向后兼容性。老的读者可以忽略新添加的列，继续读取它们能识别的字段。

---

### 3. Parquet 文件结构详解

一个 Parquet 文件在物理上是如何组织的？

1.  **行组**：
    *   文件被水平分割成多个**行组**。每个行组包含数据的**一个子集**（例如 10,000 行）。
    *   行组是数据压缩、编码和读/写的基本单元。它也是**并行处理**的单元。

2.  **列块**：
    *   在每个行组内部，数据被**垂直**分割成**列块**。一个列块包含某一列在对应行组中的所有数据。
    *   例如，一个包含 `name`, `age`, `city` 三列的表，每个行组内都会有 3 个列块。

3.  **页**：
    *   列块进一步被分割成**页**。页是编码和压缩的最小单位。
    *   页主要包括：
        *   **数据页**：存储实际的列值。
        *   **字典页**：存储该列的字典（如果使用了字典编码）。
        *   **索引页**：存储每页的统计信息（最小值、最大值等），用于谓词下推。

4.  **Footer（文件页脚）**：
    *   文件的末尾部分，包含至关重要的**元数据**：
        *   **File MetaData**： 文件的 Schema（列名、数据类型）、每个行组的元数据（每个列块的位置、压缩后的大小、未压缩的大小、编码、统计信息如 min/max/count 等）。
        *   **Magic Number**： 用于标识文件为 Parquet 格式。

**读取流程**：当查询引擎要读取一个 Parquet 文件时，它首先读取文件末尾的 Footer，获取元数据。然后，根据查询条件（如 `WHERE age > 30`），利用元数据中的统计信息快速定位到可能包含相关数据的行组和页，最后只读取这些必要的列块和数据页到内存中。

---

### 4. 如何使用 Parquet？

#### 在 Python (Pandas) 中使用：

```python
import pandas as pd
import pyarrow.parquet as pq

# 1. 将 DataFrame 保存为 Parquet 文件
df = pd.DataFrame({
    'id': range(1000000),
    'name': ['user_' + str(i) for i in range(1000000)],
    'value': np.random.randn(1000000)
})
df.to_parquet('data.parquet', engine='pyarrow', compression='snappy') # 指定压缩算法

# 2. 从 Parquet 文件读取 DataFrame
# 注意：这里可以高效地只读取我们需要的列！
new_df = pd.read_parquet('data.parquet', columns=['id', 'value']) # 列裁剪
print(new_df.head())

# 3. 使用 PyArrow 直接读取元数据
parquet_file = pq.ParquetFile('data.parquet')
print(parquet_file.metadata) # 打印文件元数据
print(parquet_file.schema)   # 打印 schema
```

#### 在 Spark (Scala/PySpark) 中使用：

```scala
// 读取 Parquet 文件（Spark 默认数据源就是 Parquet）
val df = spark.read.parquet("hdfs://path/to/parquet/files")

// 执行查询，Spark 会自动利用列裁剪和谓词下推
val result = df.select("name", "value").where("value > 0.5")

// 将数据保存为 Parquet 格式
result.write.parquet("hdfs://path/to/output")
```

#### 在 DuckDB 中使用：

正如我们之前讨论的，DuckDB 可以无缝查询 Parquet 文件。

```sql
-- 直接查询 Parquet 文件，无需导入
SELECT name, AVG(value) 
FROM read_parquet('data.parquet') 
WHERE id > 500000 
GROUP BY name;

-- 甚至可以查询多个 Parquet 文件（类似分区表）
SELECT * FROM read_parquet('*.parquet');
```

---

### 总结：何时使用 Parquet？

**你应该优先使用 Parquet 当：**

*   你的工作负载主要是**分析型查询**（读取大量数据，但只涉及部分列）。
*   你处理的是**大数据**（GB、TB 级别），并且关心 I/O 性能和存储成本。
*   你在大数据生态系统（如 Spark、Hadoop、Presto）中工作。
*   你需要存储**嵌套的**或**半结构化的**数据。

**你可能不需要 Parquet 当：**

*   你的工作负载是**事务型**的，包含大量的小规模、随机的写入和更新（Parquet 是为一次性写入、多次读取优化的，更新成本高）。
*   你处理的是**小数据**，并且需要人类可读的格式（如 CSV）。
*   你需要逐行处理数据，并且每次处理都需要整行信息。

总而言之，**Parquet 是现代数据架构中用于分析和数据仓库场景的基石技术**，它与 DuckDB 这样的高性能分析引擎结合，能为数据科学家和工程师提供无与伦比的效率和性能。