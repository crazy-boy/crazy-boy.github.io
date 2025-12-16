---
title: 极小化极大算法(Minimax)与Alpha-Beta剪枝：棋类AI的决策智慧
tags: [PHP,算法,Minimax,Alpha-Beta剪枝]
categories: [算法]
abbrlink: 'minimax-alpha-beta'
date: 2025-11-20 10:38:21
updated: 2025-11-20 10:38:21
---


> 如何让计算机在棋类游戏中做出最优决策？极小化极大算法揭示了博弈对抗中的最优策略选择，而Alpha-Beta剪枝则让这一过程变得高效可行。

## 问题背景

在棋类游戏AI开发中，核心挑战是：

- **博弈对抗性**：你的收益就是对手的损失，决策相互影响
- **决策复杂度**：象棋约有10^120种可能局面，围棋更有10^170种
- **有限前瞻**：无法计算到终局，需要在有限时间内做出最佳决策
- **策略优化**：找到在对手最优应对下的最优策略

极小化极大算法为这些问题提供了数学上优美的解决方案。

## 基本概念

### 博弈树

将棋类游戏建模为树结构：
- **根节点**：当前局面
- **子节点**：可能的下一步走法
- **叶子节点**：游戏结束或达到搜索深度的局面
- **边**：走法动作

### 评估函数

用于评价非终局局面优劣的函数：
- 正数：对最大化方有利
- 负数：对最小化方有利
- 零：均势局面

## 极小化极大算法(Minimax)

### 核心思想

**假设对手总是采取对你最不利的走法，在此基础上选择对自己最有利的走法。**

### 算法原理

1. **最大化层(MAX层)**：轮到己方走棋，选择评估值最大的走法
2. **最小化层(MIN层)**：轮到对手走棋，选择评估值最小的走法
3. **交替进行**：在博弈树中交替应用最大化和最小化选择

### 数学表达

对于深度为d的博弈树：
- 如果d=0或游戏结束：返回评估值
- 如果当前是MAX层：$max(Minimax(child))$
- 如果当前是MIN层：$min(Minimax(child))$

## Alpha-Beta剪枝

### 核心思想

**通过剪除不可能影响最终决策的分支，大幅减少搜索节点数量。**

### 剪枝原理

维护两个值：
- **α**：MAX方至少能保证的分数（下界）
- **β**：MIN方至少能保证的分数（上界）

当发现某个分支的分数已经不可能被选择时，立即停止搜索该分支。

### 剪枝条件

1. **α剪枝**：在MIN层，如果当前节点值 ≤ α，则剪枝
2. **β剪枝**：在MAX层，如果当前节点值 ≥ β，则剪枝

## PHP实现

### 基础游戏框架

```php
<?php

/**
 * 棋类游戏抽象类
 */
abstract class Game {
    protected $currentPlayer; // 当前玩家：1为MAX，-1为MIN
    protected $board;         // 棋盘状态
    
    /**
     * 获取所有合法走法
     */
    abstract public function getLegalMoves();
    
    /**
     * 执行走法
     */
    abstract public function makeMove($move);
    
    /**
     * 撤销走法
     */
    abstract public function undoMove($move);
    
    /**
     * 判断游戏是否结束
     */
    abstract public function isGameOver();
    
    /**
     * 评估当前局面
     */
    abstract public function evaluate();
    
    /**
     * 获取获胜方（1: MAX胜, -1: MIN胜, 0: 平局）
     */
    abstract public function getWinner();
}

/**
 * 极小化极大算法实现
 */
class MinimaxSolver {
    
    /**
     * 基础Minimax算法
     */
    public static function minimax(Game $game, $depth, $maximizingPlayer) {
        // 终止条件：达到深度或游戏结束
        if ($depth == 0 || $game->isGameOver()) {
            return $game->evaluate();
        }
        
        if ($maximizingPlayer) {
            $bestValue = -PHP_INT_MAX;
            foreach ($game->getLegalMoves() as $move) {
                $game->makeMove($move);
                $value = self::minimax($game, $depth - 1, false);
                $game->undoMove($move);
                
                $bestValue = max($bestValue, $value);
            }
            return $bestValue;
        } else {
            $bestValue = PHP_INT_MAX;
            foreach ($game->getLegalMoves() as $move) {
                $game->makeMove($move);
                $value = self::minimax($game, $depth - 1, true);
                $game->undoMove($move);
                
                $bestValue = min($bestValue, $value);
            }
            return $bestValue;
        }
    }
    
    /**
     * 获取最佳走法（基础Minimax）
     */
    public static function getBestMove(Game $game, $depth) {
        $bestMove = null;
        $bestValue = -PHP_INT_MAX;
        
        foreach ($game->getLegalMoves() as $move) {
            $game->makeMove($move);
            $value = self::minimax($game, $depth - 1, false);
            $game->undoMove($move);
            
            if ($value > $bestValue) {
                $bestValue = $value;
                $bestMove = $move;
            }
        }
        
        return $bestMove;
    }
    
    /**
     * Alpha-Beta剪枝算法
     */
    public static function alphabeta(Game $game, $depth, $alpha, $beta, $maximizingPlayer) {
        // 终止条件
        if ($depth == 0 || $game->isGameOver()) {
            return $game->evaluate();
        }
        
        if ($maximizingPlayer) {
            $value = -PHP_INT_MAX;
            foreach ($game->getLegalMoves() as $move) {
                $game->makeMove($move);
                $value = max($value, self::alphabeta($game, $depth - 1, $alpha, $beta, false));
                $game->undoMove($move);
                
                $alpha = max($alpha, $value);
                if ($value >= $beta) {
                    break; // β剪枝
                }
            }
            return $value;
        } else {
            $value = PHP_INT_MAX;
            foreach ($game->getLegalMoves() as $move) {
                $game->makeMove($move);
                $value = min($value, self::alphabeta($game, $depth - 1, $alpha, $beta, true));
                $game->undoMove($move);
                
                $beta = min($beta, $value);
                if ($value <= $alpha) {
                    break; // α剪枝
                }
            }
            return $value;
        }
    }
    
    /**
     * 获取最佳走法（Alpha-Beta剪枝）
     */
    public static function getBestMoveAlphaBeta(Game $game, $depth) {
        $bestMove = null;
        $bestValue = -PHP_INT_MAX;
        $alpha = -PHP_INT_MAX;
        $beta = PHP_INT_MAX;
        
        foreach ($game->getLegalMoves() as $move) {
            $game->makeMove($move);
            $value = self::alphabeta($game, $depth - 1, $alpha, $beta, false);
            $game->undoMove($move);
            
            if ($value > $bestValue) {
                $bestValue = $value;
                $bestMove = $move;
            }
            
            $alpha = max($alpha, $bestValue);
        }
        
        return $bestMove;
    }
    
    /**
     * 带移动排序的Alpha-Beta（更高效的剪枝）
     */
    public static function getBestMoveWithOrdering(Game $game, $depth) {
        $bestMove = null;
        $bestValue = -PHP_INT_MAX;
        $alpha = -PHP_INT_MAX;
        $beta = PHP_INT_MAX;
        
        // 对走法进行排序（好的走法优先）
        $moves = self::orderMoves($game, $game->getLegalMoves());
        
        foreach ($moves as $move) {
            $game->makeMove($move);
            $value = self::alphabeta($game, $depth - 1, $alpha, $beta, false);
            $game->undoMove($move);
            
            if ($value > $bestValue) {
                $bestValue = $value;
                $bestMove = $move;
            }
            
            $alpha = max($alpha, $bestValue);
            if ($alpha >= $beta) {
                break; // 剪枝
            }
        }
        
        return $bestMove;
    }
    
    /**
     * 走法排序：将可能更好的走法放在前面
     */
    private static function orderMoves(Game $game, $moves) {
        $scoredMoves = [];
        
        foreach ($moves as $move) {
            $score = 0;
            
            // 启发式：吃子走法优先
            if (method_exists($game, 'isCapture') && $game->isCapture($move)) {
                $score += 100;
            }
            
            // 启发式：威胁性走法优先
            if (method_exists($game, 'isThreatening') && $game->isThreatening($move)) {
                $score += 50;
            }
            
            $scoredMoves[] = ['move' => $move, 'score' => $score];
        }
        
        // 按分数降序排序
        usort($scoredMoves, function($a, $b) {
            return $b['score'] - $a['score'];
        });
        
        return array_column($scoredMoves, 'move');
    }
}

?>
```

### 具体游戏实现：井字棋

```php
<?php

/**
 * 井字棋游戏实现
 */
class TicTacToe extends Game {
    const EMPTY = 0;
    const PLAYER_X = 1;  // MAX玩家
    const PLAYER_O = -1; // MIN玩家
    
    public function __construct() {
        $this->board = array_fill(0, 3, array_fill(0, 3, self::EMPTY));
        $this->currentPlayer = self::PLAYER_X;
    }
    
    public function getLegalMoves() {
        $moves = [];
        for ($i = 0; $i < 3; $i++) {
            for ($j = 0; $j < 3; $j++) {
                if ($this->board[$i][$j] == self::EMPTY) {
                    $moves[] = ['row' => $i, 'col' => $j];
                }
            }
        }
        return $moves;
    }
    
    public function makeMove($move) {
        $this->board[$move['row']][$move['col']] = $this->currentPlayer;
        $this->currentPlayer = -$this->currentPlayer; // 切换玩家
    }
    
    public function undoMove($move) {
        $this->board[$move['row']][$move['col']] = self::EMPTY;
        $this->currentPlayer = -$this->currentPlayer; // 切换回来
    }
    
    public function isGameOver() {
        return $this->getWinner() !== null || count($this->getLegalMoves()) == 0;
    }
    
    public function getWinner() {
        // 检查行
        for ($i = 0; $i < 3; $i++) {
            if ($this->board[$i][0] != self::EMPTY && 
                $this->board[$i][0] == $this->board[$i][1] && 
                $this->board[$i][1] == $this->board[$i][2]) {
                return $this->board[$i][0];
            }
        }
        
        // 检查列
        for ($j = 0; $j < 3; $j++) {
            if ($this->board[0][$j] != self::EMPTY && 
                $this->board[0][$j] == $this->board[1][$j] && 
                $this->board[1][$j] == $this->board[2][$j]) {
                return $this->board[0][$j];
            }
        }
        
        // 检查对角线
        if ($this->board[0][0] != self::EMPTY && 
            $this->board[0][0] == $this->board[1][1] && 
            $this->board[1][1] == $this->board[2][2]) {
            return $this->board[0][0];
        }
        
        if ($this->board[0][2] != self::EMPTY && 
            $this->board[0][2] == $this->board[1][1] && 
            $this->board[1][1] == $this->board[2][0]) {
            return $this->board[0][2];
        }
        
        return null; // 没有获胜者
    }
    
    public function evaluate() {
        $winner = $this->getWinner();
        
        if ($winner === self::PLAYER_X) {
            return 10; // MAX玩家获胜
        } elseif ($winner === self::PLAYER_O) {
            return -10; // MIN玩家获胜
        }
        
        // 简单的位置评估
        $score = 0;
        
        // 中心位置更有价值
        if ($this->board[1][1] == self::PLAYER_X) $score += 3;
        if ($this->board[1][1] == self::PLAYER_O) $score -= 3;
        
        // 角位置
        $corners = [[0,0], [0,2], [2,0], [2,2]];
        foreach ($corners as $corner) {
            if ($this->board[$corner[0]][$corner[1]] == self::PLAYER_X) $score += 2;
            if ($this->board[$corner[0]][$corner[1]] == self::PLAYER_O) $score -= 2;
        }
        
        return $score;
    }
    
    /**
     * 显示棋盘
     */
    public function display() {
        $symbols = [
            self::EMPTY => ' . ',
            self::PLAYER_X => ' X ',
            self::PLAYER_O => ' O '
        ];
        
        echo "\n";
        for ($i = 0; $i < 3; $i++) {
            for ($j = 0; $j < 3; $j++) {
                echo $symbols[$this->board[$i][$j]];
            }
            echo "\n";
        }
        echo "\n";
    }
}

?>
```

## 应用示例与测试

```php
<?php

class MinimaxExamples {
    
    /**
     * 井字棋AI对战演示
     */
    public static function ticTacToeDemo() {
        echo "=== 井字棋AI对战演示 ===\n";
        
        $game = new TicTacToe();
        $depth = 9; // 搜索到终局
        
        echo "初始棋盘:\n";
        $game->display();
        
        while (!$game->isGameOver()) {
            if ($game->getCurrentPlayer() == TicTacToe::PLAYER_X) {
                echo "X方（AI）思考中...\n";
                $move = MinimaxSolver::getBestMoveAlphaBeta($game, $depth);
                $game->makeMove($move);
                echo "X方落子: ({$move['row']}, {$move['col']})\n";
            } else {
                echo "O方（AI）思考中...\n";
                $move = MinimaxSolver::getBestMoveAlphaBeta($game, $depth);
                $game->makeMove($move);
                echo "O方落子: ({$move['row']}, {$move['col']})\n";
            }
            
            $game->display();
        }
        
        $winner = $game->getWinner();
        if ($winner === TicTacToe::PLAYER_X) {
            echo "游戏结束: X方获胜!\n";
        } elseif ($winner === TicTacToe::PLAYER_O) {
            echo "游戏结束: O方获胜!\n";
        } else {
            echo "游戏结束: 平局!\n";
        }
    }
    
    /**
     * 性能对比测试
     */
    public static function performanceTest() {
        echo "\n=== 性能对比测试 ===\n";
        
        $game = new TicTacToe();
        
        // 设置一个测试局面
        $game->makeMove(['row' => 0, 'col' => 0]); // X
        $game->makeMove(['row' => 1, 'col' => 1]); // O
        $game->makeMove(['row' => 0, 'col' => 1]); // X
        
        echo "测试局面:\n";
        $game->display();
        
        $depth = 6;
        
        // 测试Minimax
        $start = microtime(true);
        $minimaxMove = MinimaxSolver::getBestMove($game, $depth);
        $minimaxTime = microtime(true) - $start;
        
        // 测试Alpha-Beta
        $start = microtime(true);
        $alphabetaMove = MinimaxSolver::getBestMoveAlphaBeta($game, $depth);
        $alphabetaTime = microtime(true) - $start;
        
        // 测试带排序的Alpha-Beta
        $start = microtime(true);
        $orderedMove = MinimaxSolver::getBestMoveWithOrdering($game, $depth);
        $orderedTime = microtime(true) - $start;
        
        echo "搜索结果:\n";
        echo "Minimax: 移动({$minimaxMove['row']}, {$minimaxMove['col']}), 时间: " . 
             number_format($minimaxTime, 4) . "秒\n";
        echo "Alpha-Beta: 移动({$alphabetaMove['row']}, {$alphabetaMove['col']}), 时间: " . 
             number_format($alphabetaTime, 4) . "秒\n";
        echo "带排序Alpha-Beta: 移动({$orderedMove['row']}, {$orderedMove['col']}), 时间: " . 
             number_format($orderedTime, 4) . "秒\n";
        
        $improvement = ($minimaxTime - $alphabetaTime) / $minimaxTime * 100;
        echo "Alpha-Beta性能提升: " . number_format($improvement, 2) . "%\n";
    }
    
    /**
     * 搜索深度影响测试
     */
    public static function depthTest() {
        echo "\n=== 搜索深度影响测试 ===\n";
        
        $game = new TicTacToe();
        
        for ($depth = 1; $depth <= 5; $depth++) {
            $start = microtime(true);
            $nodes = self::countNodes($game, $depth);
            $time = microtime(true) - $start;
            
            echo "深度 {$depth}: {$nodes} 个节点, " . 
                 number_format($time, 4) . "秒\n";
        }
    }
    
    /**
     * 计算节点数量（用于分析剪枝效果）
     */
    private static function countNodes(Game $game, $depth, $maximizing = true) {
        if ($depth == 0 || $game->isGameOver()) {
            return 1;
        }
        
        $count = 0;
        foreach ($game->getLegalMoves() as $move) {
            $game->makeMove($move);
            $count += self::countNodes($game, $depth - 1, !$maximizing);
            $game->undoMove($move);
        }
        
        return $count;
    }
}

// 运行演示
MinimaxExamples::ticTacToeDemo();
MinimaxExamples::performanceTest();
MinimaxExamples::depthTest();

?>
```

## 高级优化技术

### 1. 迭代加深

```php
class IterativeDeepeningSolver {
    /**
     * 迭代加深搜索
     */
    public static function getBestMoveIterative(Game $game, $maxDepth, $timeLimit = 10) {
        $bestMove = null;
        $startTime = microtime(true);
        
        for ($depth = 1; $depth <= $maxDepth; $depth++) {
            // 检查时间限制
            if ((microtime(true) - $startTime) > $timeLimit) {
                break;
            }
            
            $currentBest = MinimaxSolver::getBestMoveAlphaBeta($game, $depth);
            if ($currentBest !== null) {
                $bestMove = $currentBest;
            }
            
            echo "深度 {$depth} 搜索完成\n";
        }
        
        return $bestMove;
    }
}
```

### 2. 置换表

```php
class TranspositionTable {
    private $table = [];
    
    public function store($hash, $depth, $value, $flag) {
        $this->table[$hash] = [
            'depth' => $depth,
            'value' => $value,
            'flag' => $flag // EXACT, LOWER_BOUND, UPPER_BOUND
        ];
    }
    
    public function lookup($hash, $depth, $alpha, $beta) {
        if (!isset($this->table[$hash])) {
            return null;
        }
        
        $entry = $this->table[$hash];
        if ($entry['depth'] >= $depth) {
            if ($entry['flag'] == 'EXACT') {
                return $entry['value'];
            } elseif ($entry['flag'] == 'LOWER_BOUND' && $entry['value'] >= $beta) {
                return $entry['value'];
            } elseif ($entry['flag'] == 'UPPER_BOUND' && $entry['value'] <= $alpha) {
                return $entry['value'];
            }
        }
        
        return null;
    }
}
```

## 实际应用场景

### 棋类游戏AI
```php
class ChessAI {
    public function findBestMove($board, $timeLimit) {
        $game = new ChessGame($board);
        return IterativeDeepeningSolver::getBestMoveIterative(
            $game, 8, $timeLimit
        );
    }
}
```

### 策略游戏
```php
class StrategyGameAI {
    public function makeDecision($gameState) {
        $game = new StrategyGame($gameState);
        return MinimaxSolver::getBestMoveWithOrdering($game, 4);
    }
}
```

## 总结

极小化极大算法和Alpha-Beta剪枝是博弈AI的基石技术：

### 核心优势
1. **数学完备性**：在完全信息零和游戏中能找到最优策略
2. **框架通用性**：适用于各种棋类和策略游戏
3. **性能可控**：通过深度限制和剪枝平衡性能与质量
4. **扩展性强**：可结合各种优化技术

### 算法对比
| 算法 | 时间复杂度 | 空间复杂度 | 适用场景 |
|------|------------|------------|----------|
| 基础Minimax | O(b^d) | O(d) | 小型游戏树 |
| Alpha-Beta | O(b^(d/2)) | O(d) | 中型游戏树 |
| 带排序Alpha-Beta | O(b^(d/3)) | O(d) | 大型游戏树 |

### 最佳实践
1. **评估函数设计**：好的评估函数比搜索深度更重要
2. **走法排序**：将可能好的走法优先搜索以提高剪枝效率
3. **迭代加深**：结合时间限制动态调整搜索深度
4. **开局库/残局库**：对特定局面使用预计算的结果

极小化极大算法体现了"在对手最优应对下的最优选择"这一博弈论核心思想，而Alpha-Beta剪枝则展示了如何通过智能搜索来应对组合爆炸问题。这两种算法的结合为计算机博弈领域奠定了坚实基础，至今仍是许多棋类AI的核心算法。