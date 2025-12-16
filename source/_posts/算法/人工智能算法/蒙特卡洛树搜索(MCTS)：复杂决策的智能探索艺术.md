---
title: 蒙特卡洛树搜索(MCTS)：复杂决策的智能探索艺术
tags: [PHP,算法,蒙特卡洛树搜索]
categories: [算法]
abbrlink: 'monte-carlo-tree-search-mcts'
date: 2025-11-20 10:38:21
updated: 2025-11-20 10:38:21
---

> 如何让计算机在围棋这样的复杂游戏中战胜人类冠军？蒙特卡洛树搜索通过"智能随机模拟"和"选择性扩展"解决了传统搜索算法难以应对的决策复杂度问题。

## 问题背景

在复杂决策场景中（如围棋、实时策略游戏、资源规划），传统搜索算法面临巨大挑战：

- **组合爆炸**：围棋有约10^170种可能局面，远超宇宙原子数量
- **评估困难**：局面优劣难以用简单规则评估
- **实时决策**：需要在有限时间内做出合理决策
- **不确定性**：存在随机因素和对手不可预测性

蒙特卡洛树搜索通过随机模拟和统计学习，优雅地解决了这些问题。

## 基本概念

### 核心思想

**通过大量随机模拟来探索决策空间，基于统计结果指导搜索方向，逐步聚焦于更有希望的决策路径。**

### 与传统算法对比

| 特性 | 极小化极大算法 | 蒙特卡洛树搜索 |
|------|----------------|----------------|
| 搜索策略 | 系统性的深度优先 | 选择性宽度优先 |
| 评估方式 | 启发式评估函数 | 随机模拟统计 |
| 内存使用 | 指数级增长 | 线性增长 |
| 适用场景 | 完全信息博弈 | 不完全信息/复杂博弈 |

## 算法原理

蒙特卡洛树搜索包含四个核心步骤，循环执行：

### 1. 选择(Selection)
从根节点开始，使用树策略选择子节点，直到到达可扩展的节点。

### 2. 扩展(Expansion)
当遇到未完全探索的节点时，扩展一个新的子节点。

### 3. 模拟(Simulation)
从新扩展的节点开始，进行随机模拟直到游戏结束。

### 4. 回传(Backpropagation)
将模拟结果沿路径回传到根节点，更新所有经过节点的统计信息。

## PHP实现

### 基础框架

```php
<?php

/**
 * 游戏接口定义
 */
interface Game {
    // 获取当前玩家
    public function getCurrentPlayer();
    // 获取所有合法动作
    public function getLegalActions();
    // 执行动作
    public function makeMove($action);
    // 撤销动作
    public function undoMove();
    // 检查游戏是否结束
    public function isGameOver();
    // 获取获胜方
    public function getWinner();
    // 复制游戏状态
    public function copy();
}

/**
 * MCTS树节点
 */
class MCTSNode {
    public $state;          // 游戏状态
    public $parent;         // 父节点
    public $children;       // 子节点数组
    public $visitCount;     // 访问次数
    public $totalValue;     // 总价值
    public $untriedActions; // 未尝试的动作
    
    public function __construct($state, $parent = null) {
        $this->state = $state;
        $this->parent = $parent;
        $this->children = [];
        $this->visitCount = 0;
        $this->totalValue = 0;
        $this->untriedActions = $state->getLegalActions();
    }
    
    /**
     * 获取节点的Q值（平均价值）
     */
    public function getQValue() {
        return $this->visitCount > 0 ? $this->totalValue / $this->visitCount : 0;
    }
    
    /**
     * 判断节点是否完全扩展
     */
    public function isFullyExpanded() {
        return count($this->untriedActions) == 0;
    }
    
    /**
     * 判断节点是否为叶子节点
     */
    public function isLeaf() {
        return count($this->children) == 0;
    }
    
    /**
     * 更新节点统计信息
     */
    public function update($value) {
        $this->visitCount++;
        $this->totalValue += $value;
    }
}

/**
 * 蒙特卡洛树搜索核心类
 */
class MonteCarloTreeSearch {
    private $root;
    private $explorationFactor;
    
    public function __construct($explorationFactor = 1.414) {
        $this->explorationFactor = $explorationFactor; // 通常为√2
    }
    
    /**
     * 主搜索函数
     */
    public function search($initialState, $iterationCount) {
        $this->root = new MCTSNode($initialState);
        
        for ($i = 0; $i < $iterationCount; $i++) {
            $node = $this->select($this->root);
            $value = $this->simulate($node->state);
            $this->backpropagate($node, $value);
        }
        
        return $this->getBestChild($this->root, 0)->state;
    }
    
    /**
     * 选择阶段：使用UCT算法选择节点
     */
    private function select($node) {
        while (!$node->state->isGameOver()) {
            if (!$node->isFullyExpanded()) {
                return $this->expand($node);
            } else {
                $node = $this->getBestChild($node, $this->explorationFactor);
            }
        }
        return $node;
    }
    
    /**
     * 扩展阶段：扩展新节点
     */
    private function expand($node) {
        $action = array_pop($node->untriedActions);
        $nextState = $node->state->copy();
        $nextState->makeMove($action);
        
        $childNode = new MCTSNode($nextState, $node);
        $node->children[$action] = $childNode;
        
        return $childNode;
    }
    
    /**
     * 模拟阶段：随机模拟直到游戏结束
     */
    private function simulate($state) {
        $currentState = $state->copy();
        
        while (!$currentState->isGameOver()) {
            $possibleActions = $currentState->getLegalActions();
            $randomAction = $possibleActions[array_rand($possibleActions)];
            $currentState->makeMove($randomAction);
        }
        
        return $this->getReward($currentState, $state->getCurrentPlayer());
    }
    
    /**
     * 回传阶段：更新路径上的节点统计
     */
    private function backpropagate($node, $value) {
        while ($node !== null) {
            $node->update($value);
            $node = $node->parent;
            $value = 1 - $value; // 从对手视角看，价值相反
        }
    }
    
    /**
     * 使用UCT公式选择最佳子节点
     */
    private function getBestChild($node, $explorationFactor) {
        $bestScore = -PHP_FLOAT_MAX;
        $bestChild = null;
        
        foreach ($node->children as $child) {
            $exploit = $child->getQValue();
            $explore = $explorationFactor * 
                      sqrt(2 * log($node->visitCount) / ($child->visitCount + 1));
            
            $score = $exploit + $explore;
            
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestChild = $child;
            }
        }
        
        return $bestChild;
    }
    
    /**
     * 获取奖励值（从当前玩家视角）
     */
    private function getReward($finalState, $originalPlayer) {
        $winner = $finalState->getWinner();
        
        if ($winner === null) {
            return 0.5; // 平局
        } elseif ($winner === $originalPlayer) {
            return 1.0; // 获胜
        } else {
            return 0.0; // 失败
        }
    }
    
    /**
     * 获取最佳动作（用于实际决策）
     */
    public function getBestAction($iterationCount = 1000) {
        $this->search($this->root->state, $iterationCount);
        
        // 选择访问次数最多的子节点（更可靠的统计）
        $bestAction = null;
        $maxVisits = -1;
        
        foreach ($this->root->children as $action => $child) {
            if ($child->visitCount > $maxVisits) {
                $maxVisits = $child->visitCount;
                $bestAction = $action;
            }
        }
        
        return $bestAction;
    }
    
    /**
     * 更新根节点（用于连续决策）
     */
    public function updateRoot($action) {
        if (isset($this->root->children[$action])) {
            $this->root = $this->root->children[$action];
            $this->root->parent = null; // 断开与父节点的连接
        } else {
            // 如果动作不在当前树中，创建新根节点
            $newState = $this->root->state->copy();
            $newState->makeMove($action);
            $this->root = new MCTSNode($newState);
        }
    }
}

?>
```

### UCT算法实现

```php
<?php

/**
 * 增强版MCTS，包含UCT算法和其他优化
 */
class UCTMCTS extends MonteCarloTreeSearch {
    private $simulationPolicy;
    
    public function __construct($explorationFactor = 1.414, $simulationPolicy = 'random') {
        parent::__construct($explorationFactor);
        $this->simulationPolicy = $simulationPolicy;
    }
    
    /**
     * 增强的模拟策略
     */
    protected function simulate($state) {
        $currentState = $state->copy();
        
        while (!$currentState->isGameOver()) {
            $action = $this->selectSimulationAction($currentState);
            $currentState->makeMove($action);
        }
        
        return $this->getReward($currentState, $state->getCurrentPlayer());
    }
    
    /**
     * 根据策略选择模拟动作
     */
    private function selectSimulationAction($state) {
        $actions = $state->getLegalActions();
        
        switch ($this->simulationPolicy) {
            case 'random':
                return $actions[array_rand($actions)];
                
            case 'heuristic':
                return $this->heuristicAction($state, $actions);
                
            case 'epsilon_greedy':
                return $this->epsilonGreedyAction($state, $actions);
                
            default:
                return $actions[array_rand($actions)];
        }
    }
    
    /**
     * 启发式动作选择
     */
    private function heuristicAction($state, $actions) {
        // 简单的启发式：优先选择中心位置
        $scores = [];
        foreach ($actions as $action) {
            $score = $this->evaluateAction($state, $action);
            $scores[$action] = $score;
        }
        
        $maxScore = max($scores);
        $bestActions = array_keys($scores, $maxScore);
        
        return $bestActions[array_rand($bestActions)];
    }
    
    /**
     * 评估动作的启发式分数
     */
    private function evaluateAction($state, $action) {
        // 基础启发式：位置价值
        if (method_exists($state, 'getPositionValue')) {
            return $state->getPositionValue($action);
        }
        
        // 默认随机
        return rand(0, 100);
    }
    
    /**
     * ε-贪心策略
     */
    private function epsilonGreedyAction($state, $actions, $epsilon = 0.1) {
        if (rand(0, 100) / 100 < $epsilon) {
            // 探索：随机选择
            return $actions[array_rand($actions)];
        } else {
            // 利用：选择启发式最佳
            return $this->heuristicAction($state, $actions);
        }
    }
}

?>
```

### 具体游戏实现：围棋简化版

```php
<?php

/**
 * 简化版围棋游戏实现
 */
class SimpleGo implements Game {
    const EMPTY = 0;
    const BLACK = 1;
    const WHITE = 2;
    const BOARD_SIZE = 5; // 简化的小棋盘
    
    private $board;
    private $currentPlayer;
    private $moveHistory;
    private $koPoint; // 劫争点
    
    public function __construct() {
        $this->board = array_fill(0, self::BOARD_SIZE, 
                         array_fill(0, self::BOARD_SIZE, self::EMPTY));
        $this->currentPlayer = self::BLACK;
        $this->moveHistory = [];
        $this->koPoint = null;
    }
    
    public function getCurrentPlayer() {
        return $this->currentPlayer;
    }
    
    public function getLegalActions() {
        $actions = [];
        
        for ($i = 0; $i < self::BOARD_SIZE; $i++) {
            for ($j = 0; $j < self::BOARD_SIZE; $j++) {
                if ($this->isValidMove($i, $j)) {
                    $actions[] = ['x' => $i, 'y' => $j];
                }
            }
        }
        
        // 添加PASS动作
        $actions[] = ['x' => -1, 'y' => -1]; // PASS
        
        return $actions;
    }
    
    public function makeMove($action) {
        if ($action['x'] == -1 && $action['y'] == -1) {
            // PASS
            $this->moveHistory[] = ['action' => $action, 'captures' => []];
            $this->currentPlayer = $this->getOpponent($this->currentPlayer);
            $this->koPoint = null;
            return;
        }
        
        $x = $action['x'];
        $y = $action['y'];
        
        // 检查是否有效
        if (!$this->isValidMove($x, $y)) {
            throw new Exception("Invalid move: {$x}, {$y}");
        }
        
        // 执行落子
        $this->board[$x][$y] = $this->currentPlayer;
        
        // 处理提子
        $captures = $this->captureStones($x, $y);
        
        // 检查自杀规则
        if (empty($this->getGroupLiberties($x, $y))) {
            $this->board[$x][$y] = self::EMPTY;
            throw new Exception("Suicide move not allowed");
        }
        
        // 更新劫争点
        $this->updateKoPoint($captures);
        
        // 记录历史
        $this->moveHistory[] = [
            'action' => $action, 
            'captures' => $captures,
            'player' => $this->currentPlayer
        ];
        
        // 切换玩家
        $this->currentPlayer = $this->getOpponent($this->currentPlayer);
    }
    
    public function undoMove() {
        if (empty($this->moveHistory)) {
            return;
        }
        
        $lastMove = array_pop($this->moveHistory);
        $action = $lastMove['action'];
        
        if ($action['x'] == -1 && $action['y'] == -1) {
            // PASS撤销
            $this->currentPlayer = $this->getOpponent($this->currentPlayer);
            return;
        }
        
        // 撤销落子
        $this->board[$action['x']][$action['y']] = self::EMPTY;
        
        // 恢复被提的棋子
        foreach ($lastMove['captures'] as $capture) {
            $this->board[$capture['x']][$capture['y']] = $lastMove['player'] == self::BLACK ? self::WHITE : self::BLACK;
        }
        
        $this->currentPlayer = $lastMove['player'];
    }
    
    public function isGameOver() {
        // 简化规则：连续两次PASS或棋盘填满
        $passCount = 0;
        $emptyCount = 0;
        
        for ($i = count($this->moveHistory) - 1; $i >= max(0, count($this->moveHistory) - 2); $i--) {
            if (isset($this->moveHistory[$i]['action']) && 
                $this->moveHistory[$i]['action']['x'] == -1) {
                $passCount++;
            }
        }
        
        // 统计空点
        for ($i = 0; $i < self::BOARD_SIZE; $i++) {
            for ($j = 0; $j < self::BOARD_SIZE; $j++) {
                if ($this->board[$i][$j] == self::EMPTY) {
                    $emptyCount++;
                }
            }
        }
        
        return $passCount >= 2 || $emptyCount == 0;
    }
    
    public function getWinner() {
        if (!$this->isGameOver()) {
            return null;
        }
        
        // 简化计分：数子法
        $blackScore = 0;
        $whiteScore = 6.5; // 贴目
        
        for ($i = 0; $i < self::BOARD_SIZE; $i++) {
            for ($j = 0; $j < self::BOARD_SIZE; $j++) {
                if ($this->board[$i][$j] == self::BLACK) {
                    $blackScore++;
                } elseif ($this->board[$i][$j] == self::WHITE) {
                    $whiteScore++;
                }
            }
        }
        
        if ($blackScore > $whiteScore) {
            return self::BLACK;
        } elseif ($whiteScore > $blackScore) {
            return self::WHITE;
        } else {
            return null; // 平局
        }
    }
    
    public function copy() {
        $copy = new SimpleGo();
        $copy->board = [];
        foreach ($this->board as $row) {
            $copy->board[] = $row;
        }
        $copy->currentPlayer = $this->currentPlayer;
        $copy->moveHistory = $this->moveHistory;
        $copy->koPoint = $this->koPoint;
        return $copy;
    }
    
    /**
     * 显示棋盘
     */
    public function display() {
        $symbols = [
            self::EMPTY => ' . ',
            self::BLACK => ' ● ',
            self::WHITE => ' ○ '
        ];
        
        echo "\n  ";
        for ($j = 0; $j < self::BOARD_SIZE; $j++) {
            echo " {$j} ";
        }
        echo "\n";
        
        for ($i = 0; $i < self::BOARD_SIZE; $i++) {
            echo "{$i} ";
            for ($j = 0; $j < self::BOARD_SIZE; $j++) {
                echo $symbols[$this->board[$i][$j]];
            }
            echo "\n";
        }
        echo "当前玩家: " . ($this->currentPlayer == self::BLACK ? "黑方" : "白方") . "\n";
    }
    
    // 私有辅助方法
    private function isValidMove($x, $y) {
        // 检查是否在棋盘内
        if ($x < 0 || $x >= self::BOARD_SIZE || $y < 0 || $y >= self::BOARD_SIZE) {
            return false;
        }
        
        // 检查是否为空点
        if ($this->board[$x][$y] != self::EMPTY) {
            return false;
        }
        
        // 检查劫争
        if ($this->koPoint && $x == $this->koPoint['x'] && $y == $this->koPoint['y']) {
            return false;
        }
        
        return true;
    }
    
    private function getOpponent($player) {
        return $player == self::BLACK ? self::WHITE : self::BLACK;
    }
    
    private function captureStones($x, $y) {
        $opponent = $this->getOpponent($this->currentPlayer);
        $captures = [];
        
        // 检查四个方向的对手棋子
        $directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        foreach ($directions as $dir) {
            $nx = $x + $dir[0];
            $ny = $y + $dir[1];
            
            if ($nx >= 0 && $nx < self::BOARD_SIZE && $ny >= 0 && $ny < self::BOARD_SIZE &&
                $this->board[$nx][$ny] == $opponent) {
                $group = $this->getGroup($nx, $ny);
                if ($this->getGroupLiberties($nx, $ny) == 0) {
                    foreach ($group as $stone) {
                        $this->board[$stone['x']][$stone['y']] = self::EMPTY;
                        $captures[] = $stone;
                    }
                }
            }
        }
        
        return $captures;
    }
    
    private function getGroup($x, $y) {
        $color = $this->board[$x][$y];
        $group = [];
        $visited = [];
        $this->dfsGroup($x, $y, $color, $group, $visited);
        return $group;
    }
    
    private function dfsGroup($x, $y, $color, &$group, &$visited) {
        if ($x < 0 || $x >= self::BOARD_SIZE || $y < 0 || $y >= self::BOARD_SIZE) {
            return;
        }
        
        $key = "{$x},{$y}";
        if (isset($visited[$key]) || $this->board[$x][$y] != $color) {
            return;
        }
        
        $visited[$key] = true;
        $group[] = ['x' => $x, 'y' => $y];
        
        $directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        foreach ($directions as $dir) {
            $this->dfsGroup($x + $dir[0], $y + $dir[1], $color, $group, $visited);
        }
    }
    
    private function getGroupLiberties($x, $y) {
        $group = $this->getGroup($x, $y);
        $liberties = 0;
        $visited = [];
        
        foreach ($group as $stone) {
            $directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            foreach ($directions as $dir) {
                $nx = $stone['x'] + $dir[0];
                $ny = $stone['y'] + $dir[1];
                
                if ($nx >= 0 && $nx < self::BOARD_SIZE && $ny >= 0 && $ny < self::BOARD_SIZE) {
                    $key = "{$nx},{$ny}";
                    if (!isset($visited[$key]) && $this->board[$nx][$ny] == self::EMPTY) {
                        $liberties++;
                        $visited[$key] = true;
                    }
                }
            }
        }
        
        return $liberties;
    }
    
    private function updateKoPoint($captures) {
        // 简化劫争处理：如果只提一子，且该子周围情况特殊，设置劫争点
        if (count($captures) == 1) {
            $capture = $captures[0];
            $this->koPoint = $capture;
        } else {
            $this->koPoint = null;
        }
    }
}

?>
```

## 应用示例与测试

```php
<?php

class MCTSExamples {
    
    /**
     * 围棋AI对战演示
     */
    public static function goAIDemo() {
        echo "=== 围棋AI对战演示 ===\n";
        
        $game = new SimpleGo();
        $mcts = new UCTMCTS(1.414, 'heuristic');
        
        echo "初始棋盘:\n";
        $game->display();
        
        $moveCount = 0;
        $maxMoves = 10; // 限制演示步数
        
        while (!$game->isGameOver() && $moveCount < $maxMoves) {
            $playerName = $game->getCurrentPlayer() == SimpleGo::BLACK ? "黑方(AI)" : "白方(AI)";
            echo "\n{$playerName} 思考中...\n";
            
            $bestAction = $mcts->getBestAction(500); // 500次模拟
            
            if ($bestAction['x'] == -1) {
                echo "{$playerName} 选择PASS\n";
            } else {
                echo "{$playerName} 落子: ({$bestAction['x']}, {$bestAction['y']})\n";
            }
            
            $game->makeMove($bestAction);
            $mcts->updateRoot($bestAction);
            $game->display();
            
            $moveCount++;
        }
        
        $winner = $game->getWinner();
        if ($winner === SimpleGo::BLACK) {
            echo "游戏结束: 黑方获胜!\n";
        } elseif ($winner === SimpleGo::WHITE) {
            echo "游戏结束: 白方获胜!\n";
        } else {
            echo "游戏结束: 平局!\n";
        }
    }
    
    /**
     * MCTS性能分析
     */
    public static function performanceAnalysis() {
        echo "\n=== MCTS性能分析 ===\n";
        
        $game = new SimpleGo();
        $iterations = [100, 500, 1000, 2000];
        
        foreach ($iterations as $iter) {
            $startTime = microtime(true);
            
            $mcts = new MonteCarloTreeSearch();
            $bestAction = $mcts->getBestAction($iter);
            
            $endTime = microtime(true);
            $executionTime = ($endTime - $startTime) * 1000; // 毫秒
            
            echo "迭代次数: {$iter}, 执行时间: " . number_format($executionTime, 2) . "ms\n";
            echo "推荐动作: (" . $bestAction['x'] . ", " . $bestAction['y'] . ")\n";
        }
    }
    
    /**
     * 不同探索因子的比较
     */
    public static function explorationFactorComparison() {
        echo "\n=== 探索因子比较 ===\n";
        
        $game = new SimpleGo();
        $factors = [0.5, 1.0, 1.414, 2.0];
        
        foreach ($factors as $factor) {
            $mcts = new MonteCarloTreeSearch($factor);
            $bestAction = $mcts->getBestAction(500);
            
            echo "探索因子: " . number_format($factor, 3) . 
                 ", 推荐动作: (" . $bestAction['x'] . ", " . $bestAction['y'] . ")\n";
        }
    }
    
    /**
     * 树结构分析
     */
    public static function treeStructureAnalysis() {
        echo "\n=== 树结构分析 ===\n";
        
        $game = new SimpleGo();
        $mcts = new MonteCarloTreeSearch();
        
        $bestAction = $mcts->getBestAction(1000);
        
        // 分析根节点的子节点
        $root = new ReflectionProperty('MonteCarloTreeSearch', 'root');
        $root->setAccessible(true);
        $rootNode = $root->getValue($mcts);
        
        echo "根节点访问次数: " . $rootNode->visitCount . "\n";
        echo "子节点数量: " . count($rootNode->children) . "\n";
        
        echo "前5个子节点统计:\n";
        $childStats = [];
        foreach ($rootNode->children as $action => $child) {
            $childStats[] = [
                'action' => $action,
                'visits' => $child->visitCount,
                'value' => $child->getQValue()
            ];
        }
        
        // 按访问次数排序
        usort($childStats, function($a, $b) {
            return $b['visits'] - $a['visits'];
        });
        
        for ($i = 0; $i < min(5, count($childStats)); $i++) {
            $stat = $childStats[$i];
            echo "动作({$stat['action']['x']},{$stat['action']['y']}): " .
                 "访问{$stat['visits']}次, 价值" . number_format($stat['value'], 3) . "\n";
        }
    }
}

// 运行演示
MCTSExamples::goAIDemo();
MCTSExamples::performanceAnalysis();
MCTSExamples::explorationFactorComparison();
MCTSExamples::treeStructureAnalysis();

?>
```

## 高级优化技术

### 1. 并行MCTS

```php
<?php

/**
 * 并行蒙特卡洛树搜索
 */
class ParallelMCTS extends MonteCarloTreeSearch {
    private $threadCount;
    
    public function __construct($explorationFactor = 1.414, $threadCount = 4) {
        parent::__construct($explorationFactor);
        $this->threadCount = $threadCount;
    }
    
    /**
     * 并行搜索
     */
    public function search($initialState, $iterationCount) {
        $iterationsPerThread = ceil($iterationCount / $this->threadCount);
        $results = [];
        
        // 使用多个进程/线程并行搜索
        for ($i = 0; $i < $this->threadCount; $i++) {
            $results[] = $this->searchThread($initialState, $iterationsPerThread);
        }
        
        // 合并结果（简化实现）
        return $this->mergeResults($results);
    }
    
    private function searchThread($state, $iterations) {
        // 实际实现中会使用多线程
        $threadMCTS = new MonteCarloTreeSearch($this->explorationFactor);
        return $threadMCTS->search($state, $iterations);
    }
    
    private function mergeResults($results) {
        // 简化合并：返回第一个结果
        return $results[0];
    }
}

?>
```

### 2. 基于神经网络的MCTS（AlphaGo风格）

```php
<?php

/**
 * 神经网络引导的MCTS
 */
class NeuralMCTS extends MonteCarloTreeSearch {
    private $policyNetwork;
    private $valueNetwork;
    
    public function __construct($policyNetwork, $valueNetwork, $explorationFactor = 1.414) {
        parent::__construct($explorationFactor);
        $this->policyNetwork = $policyNetwork;
        $this->valueNetwork = $valueNetwork;
    }
    
    /**
     * 使用神经网络指导模拟
     */
    protected function simulate($state) {
        // 以一定概率使用神经网络评估
        if (rand(0, 100) < 80) { // 80%概率使用神经网络
            return $this->valueNetwork->evaluate($state);
        } else {
            return parent::simulate($state);
        }
    }
    
    /**
     * 使用策略网络指导动作选择
     */
    protected function expand($node) {
        $action = $this->selectActionWithPolicy($node);
        $nextState = $node->state->copy();
        $nextState->makeMove($action);
        
        $childNode = new MCTSNode($nextState, $node);
        $node->children[$action] = $childNode;
        
        return $childNode;
    }
    
    private function selectActionWithPolicy($node) {
        $policyProbs = $this->policyNetwork->getActionProbabilities($node->state);
        
        // 根据策略概率选择动作
        $random = rand(0, 100) / 100;
        $cumulative = 0;
        
        foreach ($policyProbs as $action => $prob) {
            $cumulative += $prob;
            if ($random <= $cumulative) {
                return $action;
            }
        }
        
        // 回退到随机选择
        return $node->untriedActions[array_rand($node->untriedActions)];
    }
}

?>
```

## 实际应用场景

### 游戏AI开发
```php
class GameAI {
    private $mcts;
    
    public function __construct() {
        $this->mcts = new UCTMCTS(1.414, 'heuristic');
    }
    
    public function getMove($gameState) {
        return $this->mcts->getBestAction(1000);
    }
    
    public function learnFromGame($gameHistory) {
        // 从游戏历史中学习，更新策略
        foreach ($gameHistory as $position) {
            $this->updatePolicy($position);
        }
    }
}
```

### 资源调度优化
```php
class ResourceScheduler {
    private $mcts;
    
    public function scheduleTasks($tasks, $resources) {
        $schedulingGame = new SchedulingGame($tasks, $resources);
        return $this->mcts->search($schedulingGame, 5000);
    }
}
```

## 总结

蒙特卡洛树搜索是复杂决策问题的革命性解决方案：

### 核心优势
1. **无需领域知识**：不依赖复杂的启发式评估函数
2. **渐进式改进**：搜索时间越长，决策质量越高
3. **内存效率**：只存储访问过的节点，内存使用线性增长
4. **并行友好**：容易实现并行化加速
5. **通用性强**：适用于各种决策问题

### 算法复杂度
| 组件 | 时间复杂度 | 空间复杂度 |
|------|------------|------------|
| 选择阶段 | O(深度) | O(1) |
| 扩展阶段 | O(1) | O(1) |
| 模拟阶段 | O(模拟长度) | O(1) |
| 回传阶段 | O(深度) | O(1) |
| 总体 | O(迭代次数 × 模拟长度) | O(节点数量) |

### 关键参数
1. **探索因子**：平衡探索与利用（通常为√2）
2. **模拟策略**：随机、启发式或神经网络引导
3. **迭代次数**：决定决策质量的主要因素
4. **并行度**：充分利用多核处理器

### 历史意义
- **2006年**：MCTS首次在计算机围棋中展示潜力
- **2016年**：AlphaGo结合MCTS和深度学习击败人类冠军
- **现今**：成为复杂决策问题的标准解决方案

蒙特卡洛树搜索的成功证明了"通过随机探索和统计学习解决复杂问题"这一范式的威力，是人工智能领域的重要里程碑。