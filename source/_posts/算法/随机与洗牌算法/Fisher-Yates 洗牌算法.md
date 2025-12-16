---
title: Fisher-Yates 洗牌算法
tags: [PHP,算法,Fisher-Yates]
categories: [算法]
abbrlink: 'fisher-yates'
date: 2025-11-20 10:38:21
updated: 2025-11-20 10:38:21
---

Fisher-Yates 洗牌算法（也称为 Knuth 洗牌）是一种高效且公正的随机洗牌算法，用于将数组或列表中的元素随机重新排列。

### 🎯 算法原理

**核心思想**：从后往前遍历数组，将当前元素与随机位置的一个元素交换。

### 📝 算法步骤

**原始版本**：
```javascript
// 从后往前遍历
for i from n-1 down to 1 do:
    j = 随机整数 (0 ≤ j ≤ i)
    交换 array[i] 和 array[j]
```

**现代版本（Knuth 改进）**：
```javascript
// 从前往后遍历（更直观）
for i from 0 to n-2 do:
    j = 随机整数 (i ≤ j ≤ n-1)
    交换 array[i] 和 array[j]
```

### 🔢 示例演示

假设数组：`[1, 2, 3, 4, 5]`

**步骤**：
1. i=0: j=随机(0-4)，假设 j=2 → 交换 arr[0] 和 arr[2]
   - 数组变为：`[3, 2, 1, 4, 5]`
2. i=1: j=随机(1-4)，假设 j=3 → 交换 arr[1] 和 arr[3]
   - 数组变为：`[3, 4, 1, 2, 5]`
3. i=2: j=随机(2-4)，假设 j=2 → 无交换
   - 数组保持：`[3, 4, 1, 2, 5]`
4. i=3: j=随机(3-4)，假设 j=4 → 交换 arr[3] 和 arr[4]
   - 最终结果：`[3, 4, 1, 5, 2]`

### 💻 代码实现

**PHP 实现**：
```php
function fisherYatesShuffle(array &$array): void
{
    $count = count($array);
    for ($i = $count - 1; $i > 0; $i--) {
        $j = random_int(0, $i);  // 生成 0 到 i 的随机整数
        [$array[$i], $array[$j]] = [$array[$j], $array[$i]];
    }
}

// 使用示例
$girds = [1, 2, 3, 4, 5];
fisherYatesShuffle($girds);
```

**JavaScript 实现**：
```javascript
function fisherYatesShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
```

### ✅ 算法优势

1. **均匀分布**：每个排列出现的概率相等
2. **时间复杂度**：O(n) - 非常高效
3. **空间复杂度**：O(1) - 原地操作
4. **无偏性**：真正的随机洗牌

### ❌ 对比其他方法的劣势

**错误方法示例**：
```javascript
// ❌ 错误：非均匀分布
array.sort(() => Math.random() - 0.5);

// ❌ 错误：可能重复交换，效率低
for (let i = 0; i < array.length; i++) {
    const j = Math.floor(Math.random() * array.length);
    [array[i], array[j]] = [array[j], array[i]];
}
```

Fisher-Yates 是洗牌算法的**黄金标准**，在需要真正随机排列时应该优先选择它。