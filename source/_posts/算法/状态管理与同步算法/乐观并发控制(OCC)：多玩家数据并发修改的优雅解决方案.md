---
title: 乐观并发控制(OCC)：多玩家数据并发修改的优雅解决方案
tags: [乐观并发控制]
categories: [算法]
abbrlink: 'optimistic-concurrency-control-multiplayer'
date: 2025-11-20 10:38:21
updated: 2025-11-20 10:38:21
---

> 如何让多个玩家同时修改游戏数据而不产生冲突？乐观并发控制通过"先操作，后验证"的方式，在保证数据一致性的同时提供高性能的并发访问。

## 问题背景

在多人在线游戏和分布式系统中，经常面临多个客户端同时修改同一数据的挑战：

- **资源竞争**：多个玩家同时抢夺同一物品
- **数据不一致**：不同客户端看到的数据状态不一致
- **性能瓶颈**：传统锁机制导致的等待和性能下降
- **用户体验**：玩家操作响应延迟影响游戏体验

传统悲观锁机制在高并发场景下性能较差，而乐观并发控制提供了更好的解决方案。

## 基本概念

### 核心思想

**乐观并发控制基于这样的假设：数据竞争很少发生，因此允许多个事务同时进行修改，只在提交时检查是否有冲突。**

### 与传统锁机制对比

| 特性 | 悲观并发控制 | 乐观并发控制 |
|------|-------------|-------------|
| 并发策略 | 先加锁，后操作 | 先操作，后验证 |
| 冲突处理 | 预防冲突 | 检测并解决冲突 |
| 性能特点 | 写操作频繁时性能差 | 读多写少时性能好 |
| 适用场景 | 高竞争环境 | 低竞争环境 |
| 实现复杂度 | 相对简单 | 相对复杂 |

## OCC工作原理

### 三阶段流程

1. **读取阶段**：事务读取数据并记录版本信息
2. **修改阶段**：在本地进行数据修改
3. **验证阶段**：提交时检查数据是否被其他事务修改，若无冲突则提交，否则回滚

### 版本控制机制

```php
class VersionedData {
    public $data;
    public $version;
    public $lastModified;
    
    public function __construct($data, $version = 0) {
        $this->data = $data;
        $this->version = $version;
        $this->lastModified = time();
    }
}
```

## PHP实现

### 基础乐观并发控制系统

```php
<?php

/**
 * 乐观并发控制管理器
 */
class OptimisticConcurrencyManager {
    private $dataStore;
    private $pendingTransactions;
    
    public function __construct() {
        $this->dataStore = [];
        $this->pendingTransactions = [];
    }
    
    /**
     * 读取数据（带版本号）
     */
    public function read($key) {
        if (!isset($this->dataStore[$key])) {
            throw new Exception("数据不存在: {$key}");
        }
        
        $versionedData = $this->dataStore[$key];
        return [
            'data' => clone $versionedData->data, // 返回副本
            'version' => $versionedData->version,
            'key' => $key
        ];
    }
    
    /**
     * 开始事务
     */
    public function beginTransaction($transactionId) {
        $this->pendingTransactions[$transactionId] = [
            'start_time' => microtime(true),
            'read_set' => [],  // 读取的数据集合
            'write_set' => [], // 要写入的数据集合
            'status' => 'active'
        ];
        
        return $transactionId;
    }
    
    /**
     * 在事务中读取数据
     */
    public function transactionRead($transactionId, $key) {
        $this->validateTransaction($transactionId);
        
        $data = $this->read($key);
        $this->pendingTransactions[$transactionId]['read_set'][$key] = $data;
        
        return $data['data'];
    }
    
    /**
     * 在事务中写入数据
     */
    public function transactionWrite($transactionId, $key, $newData) {
        $this->validateTransaction($transactionId);
        
        // 记录写入操作
        $this->pendingTransactions[$transactionId]['write_set'][$key] = [
            'data' => $newData,
            'original_version' => isset($this->dataStore[$key]) ? 
                                 $this->dataStore[$key]->version : 0
        ];
        
        return true;
    }
    
    /**
     * 提交事务
     */
    public function commit($transactionId) {
        $this->validateTransaction($transactionId);
        $transaction = $this->pendingTransactions[$transactionId];
        
        // 验证阶段：检查读取的数据是否被修改
        if (!$this->validateReadSet($transaction['read_set'])) {
            $this->abort($transactionId);
            throw new OptimisticConcurrencyException("事务提交失败：数据版本冲突");
        }
        
        // 写入阶段：应用所有修改
        foreach ($transaction['write_set'] as $key => $writeOp) {
            $this->applyWrite($key, $writeOp['data'], $writeOp['original_version']);
        }
        
        // 标记事务完成
        $this->pendingTransactions[$transactionId]['status'] = 'committed';
        $this->cleanupTransaction($transactionId);
        
        return true;
    }
    
    /**
     * 回滚事务
     */
    public function abort($transactionId) {
        $this->validateTransaction($transactionId);
        $this->pendingTransactions[$transactionId]['status'] = 'aborted';
        $this->cleanupTransaction($transactionId);
        return true;
    }
    
    /**
     * 验证读取集合中的数据版本
     */
    private function validateReadSet($readSet) {
        foreach ($readSet as $key => $readData) {
            if (!isset($this->dataStore[$key])) {
                // 数据已被删除
                return false;
            }
            
            $currentData = $this->dataStore[$key];
            if ($currentData->version !== $readData['version']) {
                // 版本不匹配
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 应用写入操作
     */
    private function applyWrite($key, $data, $expectedVersion) {
        if (!isset($this->dataStore[$key])) {
            // 新数据
            $this->dataStore[$key] = new VersionedData($data, 1);
            return;
        }
        
        $currentData = $this->dataStore[$key];
        if ($currentData->version !== $expectedVersion) {
            throw new OptimisticConcurrencyException("写入冲突：数据版本不匹配");
        }
        
        // 更新数据和版本号
        $currentData->data = $data;
        $currentData->version++;
        $currentData->lastModified = time();
    }
    
    /**
     * 验证事务状态
     */
    private function validateTransaction($transactionId) {
        if (!isset($this->pendingTransactions[$transactionId])) {
            throw new Exception("事务不存在: {$transactionId}");
        }
        
        $transaction = $this->pendingTransactions[$transactionId];
        if ($transaction['status'] !== 'active') {
            throw new Exception("事务状态异常: {$transaction['status']}");
        }
    }
    
    /**
     * 清理已完成的事务
     */
    private function cleanupTransaction($transactionId) {
        // 保留一段时间用于调试，然后清理
        unset($this->pendingTransactions[$transactionId]);
    }
    
    /**
     * 初始化数据
     */
    public function initializeData($key, $data) {
        $this->dataStore[$key] = new VersionedData($data);
        return $this->dataStore[$key]->version;
    }
    
    /**
     * 获取数据当前状态（调试用）
     */
    public function getDataState($key) {
        if (!isset($this->dataStore[$key])) {
            return null;
        }
        
        $data = $this->dataStore[$key];
        return [
            'data' => $data->data,
            'version' => $data->version,
            'last_modified' => $data->lastModified
        ];
    }
}

/**
 * 乐观并发异常
 */
class OptimisticConcurrencyException extends Exception {
    public function __construct($message = "", $code = 0, Throwable $previous = null) {
        parent::__construct($message, $code, $previous);
    }
}

/**
 * 版本化数据包装器
 */
class VersionedData {
    public $data;
    public $version;
    public $lastModified;
    
    public function __construct($data, $version = 0) {
        $this->data = $data;
        $this->version = $version;
        $this->lastModified = microtime(true);
    }
}

?>
```

### 游戏库存管理系统

```php
<?php

/**
 * 游戏库存项
 */
class InventoryItem {
    public $itemId;
    public $name;
    public $quantity;
    public $price;
    
    public function __construct($itemId, $name, $quantity, $price) {
        $this->itemId = $itemId;
        $this->name = $name;
        $this->quantity = $quantity;
        $this->price = $price;
    }
    
    public function toArray() {
        return [
            'item_id' => $this->itemId,
            'name' => $this->name,
            'quantity' => $this->quantity,
            'price' => $this->price
        ];
    }
}

/**
 * 游戏库存管理系统（使用乐观并发控制）
 */
class GameInventorySystem {
    private $occManager;
    private $transactionTimeout;
    
    public function __construct() {
        $this->occManager = new OptimisticConcurrencyManager();
        $this->transactionTimeout = 30; // 30秒超时
    }
    
    /**
     * 初始化库存
     */
    public function initializeInventory($items) {
        foreach ($items as $item) {
            $key = "item_{$item['item_id']}";
            $this->occManager->initializeData($key, new InventoryItem(
                $item['item_id'],
                $item['name'],
                $item['quantity'],
                $item['price']
            ));
        }
        
        echo "库存初始化完成\n";
    }
    
    /**
     * 玩家购买物品
     */
    public function purchaseItem($playerId, $itemId, $quantity) {
        $transactionId = $this->occManager->beginTransaction("purchase_{$playerId}_{$itemId}");
        
        try {
            $key = "item_{$itemId}";
            
            // 读取物品信息
            $item = $this->occManager->transactionRead($transactionId, $key);
            
            echo "玩家 {$playerId} 尝试购买 {$quantity} 个 {$item->name}\n";
            echo "当前库存: {$item->quantity}, 价格: {$item->price}\n";
            
            // 检查库存是否足够
            if ($item->quantity < $quantity) {
                $this->occManager->abort($transactionId);
                return [
                    'success' => false,
                    'message' => "库存不足，仅剩 {$item->quantity} 个"
                ];
            }
            
            // 计算总价
            $totalPrice = $item->price * $quantity;
            
            // 模拟支付验证
            if (!$this->processPayment($playerId, $totalPrice)) {
                $this->occManager->abort($transactionId);
                return [
                    'success' => false,
                    'message' => "支付失败"
                ];
            }
            
            // 更新库存
            $updatedItem = new InventoryItem(
                $item->itemId,
                $item->name,
                $item->quantity - $quantity,
                $item->price
            );
            
            $this->occManager->transactionWrite($transactionId, $key, $updatedItem);
            
            // 提交事务
            $this->occManager->commit($transactionId);
            
            echo "玩家 {$playerId} 成功购买 {$quantity} 个 {$item->name}\n";
            echo "剩余库存: {$updatedItem->quantity}\n";
            
            return [
                'success' => true,
                'message' => "购买成功",
                'total_price' => $totalPrice,
                'remaining_quantity' => $updatedItem->quantity
            ];
            
        } catch (OptimisticConcurrencyException $e) {
            $this->occManager->abort($transactionId);
            echo "玩家 {$playerId} 购买失败：版本冲突，正在重试...\n";
            
            // 自动重试
            return $this->purchaseItemWithRetry($playerId, $itemId, $quantity, 3);
            
        } catch (Exception $e) {
            $this->occManager->abort($transactionId);
            return [
                'success' => false,
                'message' => "购买失败: " . $e->getMessage()
            ];
        }
    }
    
    /**
     * 带重试的购买操作
     */
    private function purchaseItemWithRetry($playerId, $itemId, $quantity, $maxRetries) {
        $retryCount = 0;
        
        while ($retryCount < $maxRetries) {
            try {
                return $this->purchaseItem($playerId, $itemId, $quantity);
            } catch (OptimisticConcurrencyException $e) {
                $retryCount++;
                echo "重试 {$retryCount}/{$maxRetries}...\n";
                
                if ($retryCount < $maxRetries) {
                    usleep(100000 * $retryCount); // 指数退避
                }
            }
        }
        
        return [
            'success' => false,
            'message' => "购买失败：多次重试后仍存在冲突"
        ];
    }
    
    /**
     * 处理支付（模拟）
     */
    private function processPayment($playerId, $amount) {
        // 模拟支付处理
        echo "处理玩家 {$playerId} 的支付: {$amount} 金币\n";
        
        // 90%的成功率
        return rand(1, 10) <= 9;
    }
    
    /**
     * 批量购买物品
     */
    public function purchaseMultipleItems($playerId, $purchases) {
        $transactionId = $this->occManager->beginTransaction("batch_purchase_{$playerId}");
        
        try {
            $totalCost = 0;
            $updates = [];
            
            // 第一阶段：验证所有购买
            foreach ($purchases as $purchase) {
                $itemId = $purchase['item_id'];
                $quantity = $purchase['quantity'];
                $key = "item_{$itemId}";
                
                $item = $this->occManager->transactionRead($transactionId, $key);
                
                // 检查库存
                if ($item->quantity < $quantity) {
                    throw new Exception("物品 {$item->name} 库存不足");
                }
                
                $totalCost += $item->price * $quantity;
                $updates[$key] = [
                    'item' => $item,
                    'quantity' => $quantity
                ];
            }
            
            // 处理支付
            if (!$this->processPayment($playerId, $totalCost)) {
                throw new Exception("支付失败");
            }
            
            // 第二阶段：应用所有更新
            foreach ($updates as $key => $update) {
                $item = $update['item'];
                $quantity = $update['quantity'];
                
                $updatedItem = new InventoryItem(
                    $item->itemId,
                    $item->name,
                    $item->quantity - $quantity,
                    $item->price
                );
                
                $this->occManager->transactionWrite($transactionId, $key, $updatedItem);
            }
            
            // 提交事务
            $this->occManager->commit($transactionId);
            
            echo "玩家 {$playerId} 批量购买成功，总价: {$totalCost}\n";
            return [
                'success' => true,
                'total_cost' => $totalCost
            ];
            
        } catch (Exception $e) {
            $this->occManager->abort($transactionId);
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    /**
     * 获取库存状态
     */
    public function getInventoryStatus() {
        $status = [];
        
        // 这里应该从OCC管理器中获取所有物品键
        // 简化实现：返回固定物品状态
        $itemIds = [1, 2, 3];
        
        foreach ($itemIds as $itemId) {
            $key = "item_{$itemId}";
            try {
                $data = $this->occManager->read($key);
                $status[] = $data['data']->toArray();
            } catch (Exception $e) {
                // 物品不存在或其他错误
            }
        }
        
        return $status;
    }
}

?>
```

### 拍卖行系统

```php
<?php

/**
 * 拍卖物品
 */
class AuctionItem {
    public $auctionId;
    public $itemId;
    public $sellerId;
    public $currentBid;
    public $currentBidder;
    public $minIncrement;
    public $endTime;
    public $version;
    
    public function __construct($auctionId, $itemId, $sellerId, $startPrice, $minIncrement, $duration) {
        $this->auctionId = $auctionId;
        $this->itemId = $itemId;
        $this->sellerId = $sellerId;
        $this->currentBid = $startPrice;
        $this->currentBidder = null;
        $this->minIncrement = $minIncrement;
        $this->endTime = time() + $duration;
        $this->version = 0;
    }
}

/**
 * 拍卖行系统（使用乐观并发控制）
 */
class AuctionHouseSystem {
    private $occManager;
    private $activeAuctions;
    
    public function __construct() {
        $this->occManager = new OptimisticConcurrencyManager();
        $this->activeAuctions = [];
    }
    
    /**
     * 创建拍卖
     */
    public function createAuction($sellerId, $itemId, $startPrice, $minIncrement, $duration = 3600) {
        $auctionId = uniqid('auction_');
        $auctionItem = new AuctionItem($auctionId, $itemId, $sellerId, $startPrice, $minIncrement, $duration);
        
        $key = "auction_{$auctionId}";
        $this->occManager->initializeData($key, $auctionItem);
        $this->activeAuctions[$auctionId] = $key;
        
        echo "拍卖创建成功: {$auctionId}, 物品: {$itemId}, 起拍价: {$startPrice}\n";
        return $auctionId;
    }
    
    /**
     * 出价
     */
    public function placeBid($bidderId, $auctionId, $bidAmount) {
        $key = "auction_{$auctionId}";
        $transactionId = $this->occManager->beginTransaction("bid_{$bidderId}_{$auctionId}");
        
        try {
            // 读取拍卖信息
            $auction = $this->occManager->transactionRead($transactionId, $key);
            
            // 验证拍卖状态
            if (time() > $auction->endTime) {
                $this->occManager->abort($transactionId);
                return [
                    'success' => false,
                    'message' => "拍卖已结束"
                ];
            }
            
            // 验证出价
            if ($bidAmount < $auction->currentBid + $auction->minIncrement) {
                $this->occManager->abort($transactionId);
                return [
                    'success' => false,
                    'message' => "出价必须至少为 " . ($auction->currentBid + $auction->minIncrement)
                ];
            }
            
            // 检查出价者是否有足够资金（模拟）
            if (!$this->checkBidderFunds($bidderId, $bidAmount)) {
                $this->occManager->abort($transactionId);
                return [
                    'success' => false,
                    'message' => "资金不足"
                ];
            }
            
            // 更新拍卖状态
            $previousBidder = $auction->currentBidder;
            $previousBid = $auction->currentBid;
            
            $auction->currentBid = $bidAmount;
            $auction->currentBidder = $bidderId;
            
            $this->occManager->transactionWrite($transactionId, $key, $auction);
            $this->occManager->commit($transactionId);
            
            echo "玩家 {$bidderId} 对拍卖 {$auctionId} 出价 {$bidAmount}\n";
            
            // 退还前一个出价者的资金（模拟）
            if ($previousBidder) {
                $this->refundBidder($previousBidder, $previousBid);
            }
            
            return [
                'success' => true,
                'message' => "出价成功",
                'current_bid' => $bidAmount,
                'is_leading' => true
            ];
            
        } catch (OptimisticConcurrencyException $e) {
            $this->occManager->abort($transactionId);
            echo "玩家 {$bidderId} 出价失败：版本冲突，正在重试...\n";
            
            // 自动重试
            return $this->placeBidWithRetry($bidderId, $auctionId, $bidAmount, 3);
            
        } catch (Exception $e) {
            $this->occManager->abort($transactionId);
            return [
                'success' => false,
                'message' => "出价失败: " . $e->getMessage()
            ];
        }
    }
    
    /**
     * 带重试的出价
     */
    private function placeBidWithRetry($bidderId, $auctionId, $bidAmount, $maxRetries) {
        $retryCount = 0;
        
        while ($retryCount < $maxRetries) {
            try {
                return $this->placeBid($bidderId, $auctionId, $bidAmount);
            } catch (OptimisticConcurrencyException $e) {
                $retryCount++;
                echo "重试 {$retryCount}/{$maxRetries}...\n";
                
                // 在重试前获取最新价格，可能需要调整出价
                $currentBid = $this->getCurrentBid($auctionId);
                if ($bidAmount < $currentBid + $this->getMinIncrement($auctionId)) {
                    // 自动调整出价到最小可接受值
                    $bidAmount = $currentBid + $this->getMinIncrement($auctionId);
                    echo "自动调整出价为: {$bidAmount}\n";
                }
                
                if ($retryCount < $maxRetries) {
                    usleep(100000 * $retryCount); // 指数退避
                }
            }
        }
        
        return [
            'success' => false,
            'message' => "出价失败：多次重试后仍存在冲突"
        ];
    }
    
    /**
     * 结束拍卖
     */
    public function endAuction($auctionId) {
        $key = "auction_{$auctionId}";
        $transactionId = $this->occManager->beginTransaction("end_auction_{$auctionId}");
        
        try {
            $auction = $this->occManager->transactionRead($transactionId, $key);
            
            if (time() < $auction->endTime) {
                $this->occManager->abort($transactionId);
                return [
                    'success' => false,
                    'message' => "拍卖尚未结束"
                ];
            }
            
            if ($auction->currentBidder) {
                // 有获胜者
                $this->transferItem($auction->sellerId, $auction->currentBidder, $auction->itemId);
                $this->transferFunds($auction->currentBidder, $auction->sellerId, $auction->currentBid);
                
                echo "拍卖 {$auctionId} 结束，获胜者: {$auction->currentBidder}, 价格: {$auction->currentBid}\n";
                
                $result = [
                    'success' => true,
                    'winner' => $auction->currentBidder,
                    'final_price' => $auction->currentBid,
                    'message' => "拍卖结束，物品已转移给获胜者"
                ];
            } else {
                // 无出价，物品归还给卖家
                echo "拍卖 {$auctionId} 结束，无出价\n";
                $result = [
                    'success' => true,
                    'winner' => null,
                    'message' => "拍卖结束，无获胜者"
                ];
            }
            
            // 标记拍卖为结束
            unset($this->activeAuctions[$auctionId]);
            $this->occManager->commit($transactionId);
            
            return $result;
            
        } catch (Exception $e) {
            $this->occManager->abort($transactionId);
            return [
                'success' => false,
                'message' => "结束拍卖失败: " . $e->getMessage()
            ];
        }
    }
    
    // 辅助方法（模拟实现）
    private function checkBidderFunds($bidderId, $amount) {
        // 模拟资金检查
        return true;
    }
    
    private function refundBidder($bidderId, $amount) {
        echo "退还玩家 {$bidderId} 的资金: {$amount}\n";
    }
    
    private function transferItem($fromPlayer, $toPlayer, $itemId) {
        echo "将物品 {$itemId} 从 {$fromPlayer} 转移给 {$toPlayer}\n";
    }
    
    private function transferFunds($fromPlayer, $toPlayer, $amount) {
        echo "将 {$amount} 资金从 {$fromPlayer} 转移给 {$toPlayer}\n";
    }
    
    private function getCurrentBid($auctionId) {
        try {
            $key = "auction_{$auctionId}";
            $data = $this->occManager->read($key);
            return $data['data']->currentBid;
        } catch (Exception $e) {
            return 0;
        }
    }
    
    private function getMinIncrement($auctionId) {
        try {
            $key = "auction_{$auctionId}";
            $data = $this->occManager->read($key);
            return $data['data']->minIncrement;
        } catch (Exception $e) {
            return 1;
        }
    }
    
    /**
     * 获取活跃拍卖列表
     */
    public function getActiveAuctions() {
        $auctions = [];
        
        foreach ($this->activeAuctions as $auctionId => $key) {
            try {
                $data = $this->occManager->read($key);
                $auction = $data['data'];
                
                if (time() <= $auction->endTime) {
                    $auctions[] = [
                        'auction_id' => $auction->auctionId,
                        'item_id' => $auction->itemId,
                        'current_bid' => $auction->currentBid,
                        'current_bidder' => $auction->currentBidder,
                        'end_time' => $auction->endTime,
                        'time_remaining' => $auction->endTime - time()
                    ];
                }
            } catch (Exception $e) {
                // 拍卖不存在
                unset($this->activeAuctions[$auctionId]);
            }
        }
        
        return $auctions;
    }
}

?>
```

## 应用示例与测试

```php
<?php

class OCCExamples {
    
    /**
     * 库存系统演示
     */
    public static function inventorySystemDemo() {
        echo "=== 游戏库存系统演示 ===\n";
        
        $inventorySystem = new GameInventorySystem();
        
        // 初始化库存
        $inventorySystem->initializeInventory([
            ['item_id' => 1, 'name' => '治疗药水', 'quantity' => 10, 'price' => 50],
            ['item_id' => 2, 'name' => '魔法卷轴', 'quantity' => 5, 'price' => 100],
            ['item_id' => 3, 'name' => '强化宝石', 'quantity' => 3, 'price' => 200]
        ]);
        
        // 模拟多个玩家同时购买
        $players = ['player1', 'player2', 'player3'];
        $purchases = [];
        
        foreach ($players as $player) {
            $purchases[] = [
                'player' => $player,
                'item_id' => 1, // 都购买治疗药水
                'quantity' => rand(3, 6)
            ];
        }
        
        // 并行执行购买（模拟）
        $results = [];
        foreach ($purchases as $purchase) {
            $result = $inventorySystem->purchaseItem(
                $purchase['player'],
                $purchase['item_id'],
                $purchase['quantity']
            );
            $results[] = $result;
        }
        
        // 显示结果
        echo "\n购买结果:\n";
        foreach ($results as $i => $result) {
            $purchase = $purchases[$i];
            $status = $result['success'] ? '成功' : '失败';
            echo "玩家 {$purchase['player']}: {$status} - {$result['message']}\n";
        }
        
        // 显示最终库存状态
        echo "\n最终库存状态:\n";
        $inventory = $inventorySystem->getInventoryStatus();
        foreach ($inventory as $item) {
            echo "{$item['name']}: {$item['quantity']} 个\n";
        }
    }
    
    /**
     * 拍卖行系统演示
     */
    public static function auctionHouseDemo() {
        echo "\n=== 拍卖行系统演示 ===\n";
        
        $auctionSystem = new AuctionHouseSystem();
        
        // 创建拍卖
        $auctionId = $auctionSystem->createAuction('seller1', 'rare_sword', 1000, 100, 60); // 60秒
        
        // 模拟多个玩家出价
        $bidders = ['bidder1', 'bidder2', 'bidder3', 'bidder4'];
        $bids = [];
        
        foreach ($bidders as $bidder) {
            $bidAmount = 1000 + (array_search($bidder, $bidders) + 1) * 100;
            $bids[] = [
                'bidder' => $bidder,
                'amount' => $bidAmount
            ];
        }
        
        // 并行出价（模拟）
        echo "开始出价竞争:\n";
        $results = [];
        foreach ($bids as $bid) {
            $result = $auctionSystem->placeBid(
                $bid['bidder'],
                $auctionId,
                $bid['amount']
            );
            $results[] = $result;
            
            if ($result['success']) {
                echo "→ {$bid['bidder']} 出价 {$bid['amount']} 成功\n";
            } else {
                echo "→ {$bid['bidder']} 出价失败: {$result['message']}\n";
            }
        }
        
        // 显示拍卖状态
        echo "\n拍卖状态:\n";
        $auctions = $auctionSystem->getActiveAuctions();
        foreach ($auctions as $auction) {
            echo "拍卖 {$auction['auction_id']}: 当前出价 {$auction['current_bid']}, " .
                 "出价者 {$auction['current_bidder']}, " .
                 "剩余时间 {$auction['time_remaining']}秒\n";
        }
        
        // 结束拍卖
        echo "\n结束拍卖:\n";
        $endResult = $auctionSystem->endAuction($auctionId);
        if ($endResult['success']) {
            if ($endResult['winner']) {
                echo "获胜者: {$endResult['winner']}, 最终价格: {$endResult['final_price']}\n";
            } else {
                echo "无获胜者\n";
            }
        }
    }
    
    /**
     * 性能对比测试
     */
    public static function performanceComparison() {
        echo "\n=== 性能对比测试 ===\n";
        
        $occSystem = new GameInventorySystem();
        $occSystem->initializeInventory([
            ['item_id' => 1, 'name' => '测试物品', 'quantity' => 1000, 'price' => 10]
        ]);
        
        // 测试乐观并发控制的性能
        $startTime = microtime(true);
        $successCount = 0;
        $conflictCount = 0;
        
        $concurrentRequests = 100;
        for ($i = 0; $i < $concurrentRequests; $i++) {
            $playerId = "test_player_{$i}";
            $result = $occSystem->purchaseItem($playerId, 1, 1);
            
            if ($result['success']) {
                $successCount++;
            } else {
                if (strpos($result['message'], '版本冲突') !== false) {
                    $conflictCount++;
                }
            }
        }
        
        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000; // 毫秒
        
        echo "乐观并发控制性能测试:\n";
        echo "总请求: {$concurrentRequests}\n";
        echo "成功: {$successCount}\n";
        echo "冲突: {$conflictCount}\n";
        echo "执行时间: " . number_format($executionTime, 2) . "ms\n";
        echo "平均每请求: " . number_format($executionTime / $concurrentRequests, 2) . "ms\n";
        echo "吞吐量: " . number_format($concurrentRequests / ($executionTime / 1000), 2) . " 请求/秒\n";
    }
    
    /**
     * 冲突处理测试
     */
    public static function conflictHandlingTest() {
        echo "\n=== 冲突处理测试 ===\n";
        
        $inventorySystem = new GameInventorySystem();
        $inventorySystem->initializeInventory([
            ['item_id' => 1, 'name' => '热门物品', 'quantity' => 2, 'price' => 50]
        ]);
        
        // 模拟高竞争场景
        echo "模拟高竞争场景（3个玩家抢购2个物品）:\n";
        
        $players = ['player_a', 'player_b', 'player_c'];
        $results = [];
        
        foreach ($players as $player) {
            $results[] = $inventorySystem->purchaseItem($player, 1, 1);
        }
        
        echo "竞争结果:\n";
        foreach ($results as $i => $result) {
            $status = $result['success'] ? '✓ 成功' : '✗ 失败';
            echo "玩家 {$players[$i]}: {$status} - {$result['message']}\n";
        }
        
        // 显示最终状态
        $inventory = $inventorySystem->getInventoryStatus();
        foreach ($inventory as $item) {
            echo "剩余库存: {$item['name']} - {$item['quantity']} 个\n";
        }
    }
}

// 运行演示
OCCExamples::inventorySystemDemo();
OCCExamples::auctionHouseDemo();
OCCExamples::performanceComparison();
OCCExamples::conflictHandlingTest();

?>
```

## 高级优化技术

### 1. 多版本并发控制(MVCC)

```php
<?php

/**
 * 多版本并发控制扩展
 */
class MVCCManager extends OptimisticConcurrencyManager {
    private $versionHistory;
    
    public function __construct() {
        parent::__construct();
        $this->versionHistory = [];
    }
    
    /**
     * 读取特定版本的数据
     */
    public function readVersion($key, $version) {
        if (isset($this->versionHistory[$key][$version])) {
            return $this->versionHistory[$key][$version];
        }
        
        // 找不到特定版本，返回最新版本
        return parent::read($key);
    }
    
    /**
     * 保存版本历史
     */
    protected function applyWrite($key, $data, $expectedVersion) {
        parent::applyWrite($key, $data, $expectedVersion);
        
        // 保存历史版本
        if (!isset($this->versionHistory[$key])) {
            $this->versionHistory[$key] = [];
        }
        
        $currentData = $this->dataStore[$key];
        $this->versionHistory[$key][$currentData->version] = clone $currentData->data;
        
        // 限制历史版本数量
        if (count($this->versionHistory[$key]) > 10) {
            $oldestVersion = min(array_keys($this->versionHistory[$key]));
            unset($this->versionHistory[$key][$oldestVersion]);
        }
    }
    
    /**
     * 获取数据版本历史
     */
    public function getVersionHistory($key) {
        return isset($this->versionHistory[$key]) ? $this->versionHistory[$key] : [];
    }
}

?>
```

### 2. 冲突解决策略

```php
<?php

/**
 * 智能冲突解决器
 */
class ConflictResolver {
    
    /**
     * 自动解决库存冲突
     */
    public static function resolveInventoryConflict($currentState, $proposedUpdate, $conflictingUpdates) {
        $remainingQuantity = $currentState->quantity;
        
        // 按时间戳排序冲突更新
        usort($conflictingUpdates, function($a, $b) {
            return $a['timestamp'] <=> $b['timestamp'];
        });
        
        // 按顺序应用更新，直到库存用完
        foreach ($conflictingUpdates as $update) {
            if ($remainingQuantity >= $update['quantity']) {
                $remainingQuantity -= $update['quantity'];
            } else {
                // 库存不足，部分满足
                $update['quantity'] = $remainingQuantity;
                $remainingQuantity = 0;
            }
        }
        
        // 处理当前提议的更新
        if ($remainingQuantity >= $proposedUpdate['quantity']) {
            return $proposedUpdate; // 可以完全满足
        } else {
            $proposedUpdate['quantity'] = $remainingQuantity;
            return $remainingQuantity > 0 ? $proposedUpdate : null;
        }
    }
    
    /**
     * 解决价格冲突（取最高价）
     */
    public static function resolvePriceConflict($currentState, $proposedUpdate, $conflictingUpdates) {
        $allUpdates = array_merge([$proposedUpdate], $conflictingUpdates);
        
        // 找到最高出价
        $highestBid = $proposedUpdate;
        foreach ($allUpdates as $update) {
            if ($update['bid_amount'] > $highestBid['bid_amount']) {
                $highestBid = $update;
            }
        }
        
        return $highestBid;
    }
}

?>
```

## 实际应用场景

### 游戏内经济系统
```php
class GameEconomySystem {
    private $occManager;
    
    public function handlePlayerTrade($playerA, $playerB, $itemsA, $itemsB) {
        $transactionId = $this->occManager->beginTransaction("trade_{$playerA}_{$playerB}");
        
        try {
            // 验证双方物品和资金
            $this->validateTradeItems($playerA, $itemsA);
            $this->validateTradeItems($playerB, $itemsB);
            
            // 执行交易
            $this->executeTrade($playerA, $playerB, $itemsA, $itemsB);
            
            $this->occManager->commit($transactionId);
            return ['success' => true, 'message' => '交易成功'];
            
        } catch (OptimisticConcurrencyException $e) {
            $this->occManager->abort($transactionId);
            return $this->handleTradeWithRetry($playerA, $playerB, $itemsA, $itemsB);
        }
    }
}
```

### 排行榜系统
```php
class LeaderboardSystem {
    private $mvccManager;
    
    public function updatePlayerScore($playerId, $scoreDelta) {
        $transactionId = $this->mvccManager->beginTransaction("score_update_{$playerId}");
        
        try {
            $playerData = $this->mvccManager->transactionRead($transactionId, "player_{$playerId}");
            $playerData->score += $scoreDelta;
            
            $this->mvccManager->transactionWrite($transactionId, "player_{$playerId}", $playerData);
            $this->mvccManager->commit($transactionId);
            
        } catch (OptimisticConcurrencyException $e) {
            // 基于当前最新分数重试
            return $this->updatePlayerScore($playerId, $scoreDelta);
        }
    }
}
```

## 总结

乐观并发控制是处理多玩家并发修改的强大技术：

### 核心优势

1. **高性能**：在低冲突场景下性能远超悲观锁
2. **可扩展性**：适合分布式系统和微服务架构
3. **用户体验**：减少玩家等待时间，提升响应速度
4. **灵活性**：支持复杂的冲突解决策略

### 适用场景

- ✅ 读多写少的应用
- ✅ 冲突概率较低的系统
- ✅ 需要高吞吐量的场景
- ✅ 分布式和微服务环境
- ✅ 实时性要求高的游戏系统

### 算法复杂度

| 操作 | 时间复杂度 | 空间复杂度 |
|------|------------|------------|
| 读取数据 | O(1) | O(1) |
| 开始事务 | O(1) | O(1) |
| 验证阶段 | O(k) | O(1) |
| 提交事务 | O(m) | O(1) |

### 最佳实践

1. **合理设计重试策略**：
   - 实现指数退避避免活锁
   - 设置最大重试次数
   - 提供用户友好的错误信息

2. **优化冲突检测**：
   - 使用轻量级的版本号
   - 实现增量式冲突检测
   - 考虑业务特定的冲突解决

3. **性能监控**：
   - 监控冲突率和重试次数
   - 跟踪事务执行时间
   - 设置性能告警阈值

4. **数据设计**：
   - 合理划分数据粒度
   - 避免热点数据
   - 考虑数据局部性

乐观并发控制通过"乐观"的假设和优雅的冲突解决机制，为多玩家游戏提供了高效的数据一致性保障。理解其原理并合理应用，可以显著提升系统的并发处理能力和用户体验。