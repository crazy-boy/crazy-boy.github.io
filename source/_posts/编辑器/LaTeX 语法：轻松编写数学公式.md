---
title: LaTeX 语法：轻松编写数学公式
tags: [数学公式,LaTeX]
categories: [数学]
abbrlink: 'latex-math'
mathjax: true
date: 2024-12-26 13:39:12
updated: 2024-12-26 13:39:12
---

LaTeX 是一种强大的排版系统，特别擅长处理数学公式。它使用一系列的命令和符号来表示各种数学表达式，使得我们在文档中可以优雅地呈现复杂的数学内容。

### 基本结构

数学公式可以分为行内公式和独立公式。
* **行内公式：** 用 `$...$` 包裹，公式嵌入在文本行中；如：`这是一个行内公式 $ E = mc^2 $。`
* **独立公式：** 用 `$$...$$` 包裹，公式独占一行。如：
```latex
$$
E = mc^2
$$
```

### 常用数学符号

* **希腊字母：** `\alpha`, `\beta`, `\gamma`, ...
* **运算符：** 加法和减法(`+`和`-`), 乘法(`\times`或`\cdot`), 除法(`\div`或`\frac{a}{b}`), `=`, `\neq`, `\leq`, `\geq`, `\approx`, `\pm`
* **关系运算符：** `\in`, `\notin`, `\subset`, `\supset`, `\subseteq`, `\supseteq`
* **逻辑运算符：** `\forall`, `\exists`, `\Rightarrow`, `\Leftrightarrow`
* **集合运算符：** `\cup`, `\cap`, `\setminus`
* **极限运算符：** `\lim`, `\inf`, `\sup`
* **积分运算符：** `\int`, `\iint`, `\iiint`
* **求和运算符：** `\sum`
* **乘积运算符：** `\prod`
* **分数：** `\frac{分子}{分母}`
* **根式：** `\sqrt{表达式}`
* **上标下标：** 上标使用 `^`, 下标使用 `_`, 如：` $ a^2 + b^2 = c^2    x_1, x_2, \ldots, x_n  $
* **向量：** `\vec{a}`
* **矩阵：** 使用 `\begin{matrix}...\end{matrix}` 或 `\begin{bmatrix}...\end{bmatrix}`, 如：
  ```latex
  \begin{bmatrix}
  a_{11} & a_{12} \\
  a_{21} & a_{22}
  \end{bmatrix}
  ```

### 常用数学环境

* **方程组：**
  ```latex
  \begin{equation}
  \begin{cases}
  a_1x + b_1y = c_1 \\
  a_2x + b_2y = c_2
  \end{cases}
  \end{end{equation}
  ```
* **数组：**
  ```latex
  \begin{array}{ccc}
  a & b & c \\
  d & e & f
  \end{array}
  ```
* **矩阵：**
  ```latex
  \begin{matrix}
  a & b & c \\
  d & e & f
  \end{matrix}
  ```
* **分段函数：**
  ```latex
  f(x) = \begin{cases}
  x^2, & x > 0 \\
  0, & x = 0 \\
  -x^2, & x < 0
  \end{cases}
  ```

### 示例

```latex
$$
\frac{a}{b}
a^2 + b^2 = c^2
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
\int_{a}^{b} f(x) \, dx
\lim_{x \to \infty} \frac{1}{x} = 0
f(x) = \int_{-\infty}^\infty e^{-x^2/2} dx = \sqrt{2\pi}
\begin{bmatrix}
    a & b \\
    c & d
\end{bmatrix}
$$
```

显示效果：

$$ \frac{a}{b} $$
$$ a^2 + b^2 = c^2 $$
$$ \sum_{i=1}^{n} i = \frac{n(n+1)}{2} $$
$$ \int_{a}^{b} f(x) \, dx $$
$$ \lim_{x \to \infty} \frac{1}{x} = 0 $$
$$ f(x) = \int_{-\infty}^\infty e^{-x^2/2} dx = \sqrt{2\pi} $$
$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$

**温馨提示：**

* **LaTeX命令区分大小写。**
* **使用反斜杠`\`来表示特殊字符。**
* **对于复杂的公式，建议逐步构建，并参考在线编辑器或文档中的示例。**
* **markdown 已经支持LaTex语法。**