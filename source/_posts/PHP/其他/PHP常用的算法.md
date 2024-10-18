---
title: PHP常用的算法
tags: [算法]
categories: [PHP]
abbrlink: 'php-common-algorithm'
date: 2022-01-12 09:41:25
updated: 2022-01-12 09:41:25
---

### 冒泡排序
- 时间复杂度：O(N^2)
- 代码实现
```php
function bubbleSort($arr){
    $n = count($arr);
    for ($i=0; $i<$n-1; $i++){
        for ($j=$i+1; $j<$n; $j++){
            if ($arr[$j] < $arr[$i]){
                [$arr[$i], $arr[$j]] = [$arr[$j], $arr[$i]];
            }
        }
    }

    return $arr;
}

$arr = [45,2,5,54,3,23];
print_r(bubbleSort($arr));
// Array ( [0] => 2 [1] => 3 [2] => 5 [3] => 23 [4] => 45 [5] => 54 )
```

### 快速排序
```php
function quickSort($arr){
    $n = count($arr);
    if ($n <= 1)    return $arr;
    $index = $arr[0];
    $leftArr = $rightArr = [];
    for ($i=1; $i<$n; $i++){
        if ($arr[$i] <= $index){
            $leftArr[] = $arr[$i];
        }else{
            $rightArr[] = $arr[$i];
        }
    }

    $leftArr = quickSort($leftArr);
    $rightArr = quickSort($rightArr);

    return array_merge($leftArr,[$index],$rightArr);
}

$arr = [1,45,2,5,54,3,23];
print_r(quickSort($arr));
// Array ( [0] => 1 [1] => 2 [2] => 3 [3] => 5 [4] => 23 [5] => 45 [6] => 54 )
```

### 选择排序
- 时间复杂度：O(N^2)
- 代码实现
```php
function selectSort($arr){
    $n = count($arr);
    for ($i=0; $i<$n-1; $i++){
        $k = $i;
        for ($j=$i+1; $j<$n; $j++){
            if ($arr[$k] > $arr[$j]){
                $k = $j;
            }
        }
        if ($k != $i){
            [$arr[$k],$arr[$i]] = [$arr[$i],$arr[$k]];
        }
    }

    return $arr;
}

$arr = [1,45,2,5,54,3,23];
print_r(selectSort($arr));
// Array ( [0] => 1 [1] => 2 [2] => 3 [3] => 5 [4] => 23 [5] => 45 [6] => 54 )
```

### 插入排序
- 流程
将一个待排序的无序的数组看作是两个列表，一个有序的列表，一个无序的列表，从无序的列表每次拿出一个待插入的元素，插入到有序的列表中，直到无序列表为空，排序完毕.
- 实例
    1. 有一个无序的一维数组是这次需要排序的数组，数组是：[36,12,96,-1]
    2. 首先把数组的第一个元素 [36] 看作是一个独立的有序的列表，把剩下的元素 [12, 96, -1] 看作是一个无序的列表
    3. 第一个待插入的元素就是 12，要把 12 插入到有序的列表中，首先需要 12 和 36 比较，如果带插入的元素 12 小于 36, 就需要把 12 插入到 36前面，也就是 36 要后移一位。
    4. 插入排序实际是需要比较数组元素的总数减一轮，因为第一个元素不需要比较。
- 时间复杂度：O(N^2)
- 代码实现
    ```php
    function insertSort($arr){
        if (!is_array($arr))    return null;
        $count = count($arr);
        if ($count <= 1){
            return $arr;
        }
    
        for ($i=1; $i<$count; $i++){
            $insertValue = $arr[$i];
            $insertIndex = $i-1;
            while($insertIndex >= 0 && $insertValue < $arr[$insertIndex]){
                $arr[$insertIndex+1] = $arr[$insertIndex];
                $insertIndex--;
            }
            $arr[$insertIndex+1] = $insertValue;
        }
        return $arr;
    }
    
    $arr = [1,45,2,5,54,3,23];
    print_r(insertSort($arr));
    //  Array ( [0] => 1 [1] => 2 [2] => 3 [3] => 5 [4] => 23 [5] => 45 [6] => 54 )
    ```
### 归并排序


  
### 二分查找法
- 概念
    二分查找也称折半查找（Binary Search），它是一种效率较高的查找方法。但是，折半查找要求线性表必须采用顺序存储结构，而且表中元素按关键字有序排列。
    首先，假设表中元素是按升序排列，将表中间位置记录的关键字与查找关键字比较，如果两者相等，则查找成功；否则利用中间位置记录将表分成前、后两个子表，如果中间位置记录的关键字大于查找关键字，则进一步查找前一子表，否则进一步查找后一子表。重复以上过程，直到找到满足条件的记录，使查找成功，或直到子表不存在为止，此时查找不成功。
- 代码实例
    - 循环二分查找
    ```php
    function binarySearch($array,$findVal){
        if (!is_array($array) || empty($array)) return -1;
        
        $start = 0;
        $end = count($array) - 1;
        while ($start <= $end){
            $middle = intval(($start+$end)/2);
            if ($array[$middle] > $findVal){
                $end = $middle - 1;
            }elseif ($array[$middle] < $findVal){
                $start = $middle + 1;
            }else{
                return $middle;
            }
        }
        
        return -1;
    }
        
    $array = [3,54,67,124,542,642,843];
    echo binarySearch($array, 542);     // 4
    ```
    - 递归二分查找
    ```php
    function binarySearch($array,$findVal,$start,$end){
        $middle = intval(($start+$end)/2);
        if($start>$end) return -1;
        if ($array[$middle] > $findVal){
            return binarySearch($array,$findVal,$start,$middle-1);
        }elseif ($array[$middle] < $findVal){
            return binarySearch($array,$findVal,$middle+1,$end);
        }else{
            return $middle;
        }
    }
    
    $array = [3,54,67,124,542,642,843];
    echo binarySearch($array, 542,0,count($array)-1);     // 4
    ```