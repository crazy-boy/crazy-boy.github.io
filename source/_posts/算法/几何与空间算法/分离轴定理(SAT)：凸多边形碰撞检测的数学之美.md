---
title: 分离轴定理(SAT)：凸多边形碰撞检测的数学之美
tags: [PHP,算法,SAT]
categories: [算法]
abbrlink: 'sat-convex-polygon-collision-detection'
date: 2025-11-20 10:38:21
updated: 2025-11-20 10:38:21
---


> 如何精确判断两个复杂形状是否碰撞？分离轴定理用优雅的数学方法解决了这个计算机图形学中的经典问题。

## 问题背景

在游戏开发、物理仿真和计算机图形学中，碰撞检测是一个基础而重要的问题：

- **游戏开发**：判断子弹是否击中敌人，玩家是否碰到墙壁
- **物理引擎**：模拟刚体碰撞，计算碰撞响应
- **UI交互**：检测鼠标点击是否在复杂形状内
- **机器人**：路径规划中的障碍物避碰

对于简单的形状（如矩形、圆形），碰撞检测相对容易。但对于复杂的凸多边形，分离轴定理提供了通用且高效的解决方案。

## 基本概念

### 核心思想

分离轴定理的核心思想非常直观：**如果两个凸多边形没有碰撞，那么存在一条直线（分离轴），能够将这两个多边形完全分离开来**。

反之，如果找不到这样的分离轴，那么两个多边形就是碰撞的。

![分离轴定理示意图](https://via.placeholder.com/600x200?text=SAT+Principle:+Separating+Axis+Theorem)

### 数学基础

分离轴定理基于以下数学原理：

1. **凸多边形性质**：凸多边形的任意一条边的法线方向都可以作为候选分离轴
2. **投影理论**：将多边形投影到轴向上，检查投影区间是否重叠
3. **最小平移向量(MTV)**：找到让两个碰撞物体分开的最小移动向量

## 算法原理与步骤

### 基本步骤

对于两个凸多边形A和B的碰撞检测：

1. **获取所有候选分离轴**
   - 多边形A的每条边的法线
   - 多边形B的每条边的法线

2. **对每个分离轴进行测试**
   - 将两个多边形的所有顶点投影到当前轴上
   - 计算每个多边形在轴上的投影区间
   - 检查两个投影区间是否重叠

3. **判断结果**
   - 如果存在一个轴，两个投影区间不重叠 → 多边形分离（无碰撞）
   - 如果所有轴上的投影区间都重叠 → 多边形碰撞

### 投影区间计算

给定轴向量 $\vec{axis}$ 和多边形顶点集合 $vertices$：

- 每个顶点在轴上的投影标量：$projection = \vec{vertex} \cdot \vec{axis}$
- 多边形在轴上的投影区间：$[min(projections), max(projections)]$

两个区间 $[min_A, max_A]$ 和 $[min_B, max_B]$ 重叠的条件：
$$max_A \geq min_B \quad \text{且} \quad max_B \geq min_A$$

重叠量：$overlap = min(max_A, max_B) - max(min_A, min_B)$

## PHP实现

```php
<?php

/**
 * 2D向量类
 */
class Vector2 {
    public $x;
    public $y;
    
    public function __construct($x, $y) {
        $this->x = $x;
        $this->y = $y;
    }
    
    /**
     * 向量点积
     */
    public function dot(Vector2 $other) {
        return $this->x * $other->x + $this->y * $other->y;
    }
    
    /**
     * 向量长度平方
     */
    public function lengthSquared() {
        return $this->x * $this->x + $this->y * $this->y;
    }
    
    /**
     * 向量长度
     */
    public function length() {
        return sqrt($this->lengthSquared());
    }
    
    /**
     * 向量归一化
     */
    public function normalize() {
        $len = $this->length();
        if ($len > 0) {
            return new Vector2($this->x / $len, $this->y / $len);
        }
        return new Vector2(0, 0);
    }
    
    /**
     * 向量减法
     */
    public function subtract(Vector2 $other) {
        return new Vector2($this->x - $other->x, $this->y - $other->y);
    }
    
    /**
     * 向量加法
     */
    public function add(Vector2 $other) {
        return new Vector2($this->x + $other->x, $this->y + $other->y);
    }
    
    /**
     * 向量乘法（标量）
     */
    public function multiply($scalar) {
        return new Vector2($this->x * $scalar, $this->y * $scalar);
    }
    
    /**
     * 法向量（垂直向量）
     */
    public function perpendicular() {
        return new Vector2(-$this->y, $this->x);
    }
}

/**
 * 凸多边形类
 */
class Polygon {
    public $vertices;
    
    public function __construct($vertices) {
        $this->vertices = [];
        foreach ($vertices as $vertex) {
            if ($vertex instanceof Vector2) {
                $this->vertices[] = $vertex;
            } else {
                $this->vertices[] = new Vector2($vertex[0], $vertex[1]);
            }
        }
    }
    
    /**
     * 获取多边形的所有边
     */
    public function getEdges() {
        $edges = [];
        $count = count($this->vertices);
        
        for ($i = 0; $i < $count; $i++) {
            $current = $this->vertices[$i];
            $next = $this->vertices[($i + 1) % $count];
            $edges[] = $next->subtract($current);
        }
        
        return $edges;
    }
    
    /**
     * 获取多边形的所有分离轴（边的法线）
     */
    public function getSeparatingAxes() {
        $edges = $this->getEdges();
        $axes = [];
        
        foreach ($edges as $edge) {
            // 获取边的法线并归一化
            $normal = $edge->perpendicular()->normalize();
            $axes[] = $normal;
        }
        
        return $axes;
    }
    
    /**
     * 将多边形投影到指定轴上
     */
    public function project($axis) {
        $min = null;
        $max = null;
        
        foreach ($this->vertices as $vertex) {
            $projection = $vertex->dot($axis);
            
            if ($min === null || $projection < $min) {
                $min = $projection;
            }
            if ($max === null || $projection > $max) {
                $max = $projection;
            }
        }
        
        return ['min' => $min, 'max' => $max];
    }
}

/**
 * 分离轴定理碰撞检测器
 */
class SATCollisionDetector {
    
    /**
     * 检测两个多边形是否碰撞
     */
    public static function checkCollision(Polygon $polyA, Polygon $polyB) {
        // 获取所有候选分离轴
        $axes = array_merge(
            $polyA->getSeparatingAxes(),
            $polyB->getSeparatingAxes()
        );
        
        // 对每个轴进行测试
        foreach ($axes as $axis) {
            $projA = $polyA->project($axis);
            $projB = $polyB->project($axis);
            
            // 检查投影区间是否重叠
            if ($projA['max'] < $projB['min'] || $projB['max'] < $projA['min']) {
                // 找到分离轴，没有碰撞
                return false;
            }
        }
        
        // 所有轴都重叠，发生碰撞
        return true;
    }
    
    /**
     * 检测碰撞并计算最小平移向量(MTV)
     */
    public static function getCollisionInfo(Polygon $polyA, Polygon $polyB) {
        $axes = array_merge(
            $polyA->getSeparatingAxes(),
            $polyB->getSeparatingAxes()
        );
        
        $minOverlap = PHP_FLOAT_MAX;
        $smallestAxis = null;
        
        foreach ($axes as $axis) {
            $projA = $polyA->project($axis);
            $projB = $polyB->project($axis);
            
            // 检查是否分离
            if ($projA['max'] < $projB['min'] || $projB['max'] < $projA['min']) {
                return [
                    'collision' => false,
                    'mtv' => null,
                    'axis' => null
                ];
            }
            
            // 计算重叠量
            $overlap = min($projA['max'], $projB['max']) - 
                      max($projA['min'], $projB['min']);
            
            // 找到最小重叠量
            if ($overlap < $minOverlap) {
                $minOverlap = $overlap;
                $smallestAxis = $axis;
            }
        }
        
        // 计算最小平移向量
        $centerA = self::getCenter($polyA);
        $centerB = self::getCenter($polyB);
        $direction = $centerB->subtract($centerA);
        
        // 确保MTV方向正确（从A指向B）
        if ($direction->dot($smallestAxis) < 0) {
            $smallestAxis = $smallestAxis->multiply(-1);
        }
        
        $mtv = $smallestAxis->multiply($minOverlap);
        
        return [
            'collision' => true,
            'mtv' => $mtv,
            'overlap' => $minOverlap,
            'axis' => $smallestAxis
        ];
    }
    
    /**
     * 获取多边形中心
     */
    private static function getCenter(Polygon $poly) {
        $sumX = 0;
        $sumY = 0;
        $count = count($poly->vertices);
        
        foreach ($poly->vertices as $vertex) {
            $sumX += $vertex->x;
            $sumY += $vertex->y;
        }
        
        return new Vector2($sumX / $count, $sumY / $count);
    }
}

?>
```

## 应用示例

```php
<?php

// 使用示例
class SATExamples {
    
    /**
     * 基本碰撞检测示例
     */
    public static function basicCollisionExample() {
        echo "=== 基本碰撞检测示例 ===\n";
        
        // 创建两个矩形
        $rect1 = new Polygon([
            new Vector2(0, 0),
            new Vector2(0, 10),
            new Vector2(10, 10),
            new Vector2(10, 0)
        ]);
        
        $rect2 = new Polygon([
            new Vector2(5, 5),
            new Vector2(5, 15),
            new Vector2(15, 15),
            new Vector2(15, 5)
        ]);
        
        $collision = SATCollisionDetector::checkCollision($rect1, $rect2);
        echo "矩形1和矩形2碰撞: " . ($collision ? "是" : "否") . "\n";
        
        // 不碰撞的矩形
        $rect3 = new Polygon([
            new Vector2(20, 20),
            new Vector2(20, 30),
            new Vector2(30, 30),
            new Vector2(30, 20)
        ]);
        
        $collision2 = SATCollisionDetector::checkCollision($rect1, $rect3);
        echo "矩形1和矩形3碰撞: " . ($collision2 ? "是" : "否") . "\n";
    }
    
    /**
     * 最小平移向量示例
     */
    public static function mtvExample() {
        echo "\n=== 最小平移向量示例 ===\n";
        
        $triangle1 = new Polygon([
            new Vector2(0, 0),
            new Vector2(10, 0),
            new Vector2(5, 8)
        ]);
        
        $triangle2 = new Polygon([
            new Vector2(4, 4),
            new Vector2(14, 4),
            new Vector2(9, 12)
        ]);
        
        $collisionInfo = SATCollisionDetector::getCollisionInfo($triangle1, $triangle2);
        
        if ($collisionInfo['collision']) {
            echo "三角形发生碰撞！\n";
            echo "最小重叠量: " . number_format($collisionInfo['overlap'], 2) . "\n";
            echo "最小平移向量: (" . 
                 number_format($collisionInfo['mtv']->x, 2) . ", " . 
                 number_format($collisionInfo['mtv']->y, 2) . ")\n";
        } else {
            echo "三角形没有碰撞\n";
        }
    }
    
    /**
     * 复杂多边形碰撞检测
     */
    public static function complexPolygonExample() {
        echo "\n=== 复杂多边形碰撞检测 ===\n";
        
        // 五边形
        $pentagon = new Polygon([
            new Vector2(0, 5),
            new Vector2(4, 9),
            new Vector2(9, 7),
            new Vector2(7, 2),
            new Vector2(2, 0)
        ]);
        
        // 六边形
        $hexagon = new Polygon([
            new Vector2(5, 3),
            new Vector2(8, 1),
            new Vector2(11, 3),
            new Vector2(11, 7),
            new Vector2(8, 9),
            new Vector2(5, 7)
        ]);
        
        $collision = SATCollisionDetector::checkCollision($pentagon, $hexagon);
        echo "五边形和六边形碰撞: " . ($collision ? "是" : "否") . "\n";
        
        // 获取详细碰撞信息
        if ($collision) {
            $info = SATCollisionDetector::getCollisionInfo($pentagon, $hexagon);
            echo "最小平移向量: (" . 
                 number_format($info['mtv']->x, 2) . ", " . 
                 number_format($info['mtv']->y, 2) . ")\n";
        }
    }
    
    /**
     * 性能测试
     */
    public static function performanceTest() {
        echo "\n=== 性能测试 ===\n";
        
        // 创建多个多边形进行测试
        $polygons = [];
        for ($i = 0; $i < 10; $i++) {
            $vertices = [];
            $sides = rand(3, 8); // 3-8边形
            $centerX = rand(0, 100);
            $centerY = rand(0, 100);
            $radius = rand(5, 15);
            
            for ($j = 0; $j < $sides; $j++) {
                $angle = 2 * M_PI * $j / $sides;
                $x = $centerX + $radius * cos($angle);
                $y = $centerY + $radius * sin($angle);
                $vertices[] = new Vector2($x, $y);
            }
            
            $polygons[] = new Polygon($vertices);
        }
        
        $startTime = microtime(true);
        $collisionCount = 0;
        
        // 测试所有多边形对
        for ($i = 0; $i < count($polygons); $i++) {
            for ($j = $i + 1; $j < count($polygons); $j++) {
                if (SATCollisionDetector::checkCollision($polygons[$i], $polygons[$j])) {
                    $collisionCount++;
                }
            }
        }
        
        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000; // 毫秒
        
        echo "测试多边形数量: " . count($polygons) . "\n";
        echo "多边形对数量: " . (count($polygons) * (count($polygons) - 1) / 2) . "\n";
        echo "碰撞对数: " . $collisionCount . "\n";
        echo "执行时间: " . number_format($executionTime, 2) . " 毫秒\n";
    }
}

// 运行所有示例
SATExamples::basicCollisionExample();
SATExamples::mtvExample();
SATExamples::complexPolygonExample();
SATExamples::performanceTest();

?>
```

## 算法优化与变体

### 1. 提前终止优化
```php
class OptimizedSAT extends SATCollisionDetector {
    /**
     * 带提前终止的碰撞检测
     */
    public static function checkCollisionFast(Polygon $polyA, Polygon $polyB) {
        $axesA = $polyA->getSeparatingAxes();
        $axesB = $polyB->getSeparatingAxes();
        
        // 先测试多边形A的轴
        foreach ($axesA as $axis) {
            $projA = $polyA->project($axis);
            $projB = $polyB->project($axis);
            
            if ($projA['max'] < $projB['min'] || $projB['max'] < $projA['min']) {
                return false;
            }
        }
        
        // 再测试多边形B的轴
        foreach ($axesB as $axis) {
            $projA = $polyA->project($axis);
            $projB = $polyB->project($axis);
            
            if ($projA['max'] < $projB['min'] || $projB['max'] < $projA['min']) {
                return false;
            }
        }
        
        return true;
    }
}
```

### 2. 包围盒预检查
```php
class SATWithBoundingBox {
    /**
     * 使用AABB包围盒进行预检查
     */
    public static function checkCollisionWithAABB(Polygon $polyA, Polygon $polyB) {
        // 快速AABB检查
        if (!self::checkAABBCollision($polyA, $polyB)) {
            return false;
        }
        
        // 详细的SAT检查
        return SATCollisionDetector::checkCollision($polyA, $polyB);
    }
    
    /**
     * 轴对齐包围盒检查
     */
    private static function checkAABBCollision(Polygon $polyA, Polygon $polyB) {
        $aabbA = self::getAABB($polyA);
        $aabbB = self::getAABB($polyB);
        
        return !($aabbA['right'] < $aabbB['left'] || 
                $aabbA['left'] > $aabbB['right'] ||
                $aabbA['bottom'] < $aabbB['top'] || 
                $aabbA['top'] > $aabbB['bottom']);
    }
    
    /**
     * 获取多边形的AABB
     */
    private static function getAABB(Polygon $poly) {
        $minX = $minY = PHP_FLOAT_MAX;
        $maxX = $maxY = PHP_FLOAT_MIN;
        
        foreach ($poly->vertices as $vertex) {
            $minX = min($minX, $vertex->x);
            $minY = min($minY, $vertex->y);
            $maxX = max($maxX, $vertex->x);
            $maxY = max($maxY, $vertex->y);
        }
        
        return [
            'left' => $minX,
            'right' => $maxX,
            'top' => $minY,
            'bottom' => $maxY
        ];
    }
}
```

## 应用场景

### 游戏开发
```php
class GamePhysics {
    private $objects = [];
    
    /**
     * 检测并处理游戏对象碰撞
     */
    public function processCollisions() {
        for ($i = 0; $i < count($this->objects); $i++) {
            for ($j = $i + 1; $j < count($this->objects); $j++) {
                $objA = $this->objects[$i];
                $objB = $this->objects[$j];
                
                $collisionInfo = SATCollisionDetector::getCollisionInfo(
                    $objA->getCollisionPolygon(),
                    $objB->getCollisionPolygon()
                );
                
                if ($collisionInfo['collision']) {
                    $this->resolveCollision($objA, $objB, $collisionInfo);
                }
            }
        }
    }
    
    /**
     * 解析碰撞
     */
    private function resolveCollision($objA, $objB, $collisionInfo) {
        // 应用最小平移向量分开物体
        $mtv = $collisionInfo['mtv'];
        
        // 根据质量分配平移
        $totalMass = $objA->mass + $objB->mass;
        $ratioA = $objB->mass / $totalMass;
        $ratioB = $objA->mass / $totalMass;
        
        $objA->position = $objA->position->add($mtv->multiply(-$ratioA));
        $objB->position = $objB->position->add($mtv->multiply($ratioB));
        
        // 计算碰撞响应（速度变化）
        $this->calculateCollisionResponse($objA, $objB, $collisionInfo['axis']);
    }
}
```

## 总结

分离轴定理是碰撞检测领域的经典算法，具有以下特点：

### 核心优势
1. **数学严谨**：基于坚实的数学理论基础
2. **通用性强**：适用于任意凸多边形
3. **信息丰富**：不仅能检测碰撞，还能提供分离方向和最小平移向量
4. **性能可控**：通过优化可以达到实时性能要求

### 适用条件
- ✅ 凸多边形碰撞检测
- ✅ 2D和3D形状（3D需要更多分离轴）
- ✅ 需要精确碰撞信息的场景
- ❌ 凹多边形（需要先分解为凸多边形）
- ❌ 极高性能要求的简单形状（可用更简单算法）

### 最佳实践
1. **预检查优化**：先用AABB等简单方法排除明显不碰撞的情况
2. **顶点顺序**：保持多边形顶点顺时针或逆时针一致性
3. **缓存优化**：对静态物体缓存分离轴和投影信息
4. **精度考虑**：注意浮点数精度问题，适当使用容差值

分离轴定理将复杂的几何碰撞问题转化为简单的投影区间检查，体现了计算机图形学中"化繁为简"的智慧，是每个图形程序员都应该掌握的经典算法。