---
title: 锁步协议(Lockstep)：RTS游戏的完美同步之道
tags: [算法,锁步协议]
categories: [算法]
abbrlink: 'lockstep-protocol'
date: 2025-11-20 10:38:21
updated: 2025-11-20 10:38:21
---

> 如何让数百个作战单位在多个玩家间保持精确同步？锁步协议通过确定性仿真和命令同步，为实时战略游戏提供了完美的网络同步解决方案。

## 问题背景

在实时战略游戏(RTS)中，网络同步面临独特挑战：

- **大规模单位**：数百个作战单位需要同步状态
- **精确时序**：技能释放、攻击命中需要帧级精确
- **确定性要求**：所有客户端必须产生完全相同的结果
- **带宽限制**：同步大量单位状态会消耗巨大带宽
- **断线重连**：玩家掉线后需要快速重新同步

锁步协议通过只同步玩家输入而非游戏状态，优雅地解决了这些问题。

## 基本概念

### 核心思想

**所有客户端运行相同的确定性游戏逻辑，只通过网络同步玩家输入命令，确保每个仿真帧都产生完全相同的结果。**

### 与传统同步对比

| 特性 | 状态同步 | 锁步协议 |
|------|----------|----------|
| 同步内容 | 游戏状态 | 玩家命令 |
| 网络带宽 | 较高 | 极低 |
| 计算分布 | 服务端计算 | 客户端计算 |
| 确定性 | 依赖服务端 | 依赖确定性逻辑 |
| 容错性 | 较强 | 需要额外机制 |

## 锁步协议工作原理

### 基本流程

```
帧N:
玩家A → 命令A → 锁步服务器 → 命令A+B → 所有客户端
玩家B → 命令B → 锁步服务器 → 命令A+B → 所有客户端

所有客户端使用命令A+B执行帧N逻辑 → 相同结果
```

### 关键组件

1. **命令同步**：收集所有玩家命令后统一广播
2. **确定性仿真**：所有客户端运行相同逻辑产生相同结果
3. **帧锁定**：等待所有玩家命令到达后才推进仿真
4. **校验和验证**：定期验证各客户端状态一致性

## PHP实现

### 锁步服务器

```php
<?php

/**
 * 锁步协议服务器
 */
class LockstepServer {
    private $clients;
    private $currentFrame;
    private $frameCommands;
    private $pendingCommands;
    private $frameInterval;
    private $lastFrameTime;
    private $gameStateHash;
    
    public function __construct($frameRate = 10) {
        $this->clients = [];
        $this->currentFrame = 0;
        $this->frameCommands = [];
        $this->pendingCommands = [];
        $this->frameInterval = 1.0 / $frameRate;
        $this->lastFrameTime = microtime(true);
        $this->gameStateHash = '';
    }
    
    /**
     * 客户端连接处理
     */
    public function handleClientConnect($clientId, $playerData) {
        $this->clients[$clientId] = [
            'id' => $clientId,
            'player_id' => $playerData['player_id'],
            'last_heartbeat' => microtime(true),
            'status' => 'connected',
            'last_confirmed_frame' => 0
        ];
        
        echo "玩家 {$playerData['player_id']} 已连接\n";
        
        // 发送初始同步数据
        return $this->getSyncData($clientId);
    }
    
    /**
     * 接收客户端命令
     */
    public function receiveClientCommand($clientId, $commandData) {
        if (!isset($this->clients[$clientId])) {
            return false;
        }
        
        $frame = $commandData['frame'];
        $playerId = $this->clients[$clientId]['player_id'];
        
        // 验证帧号有效性
        if ($frame <= $this->currentFrame) {
            echo "警告: 客户端 {$clientId} 发送过时命令 for frame {$frame}\n";
            return false;
        }
        
        if ($frame > $this->currentFrame + 60) { // 限制前瞻60帧
            echo "警告: 客户端 {$clientId} 发送过于超前的命令\n";
            return false;
        }
        
        // 存储命令
        if (!isset($this->pendingCommands[$frame])) {
            $this->pendingCommands[$frame] = [];
        }
        
        $this->pendingCommands[$frame][$playerId] = [
            'command' => $commandData['command'],
            'data' => $commandData['data'],
            'checksum' => $commandData['checksum'],
            'timestamp' => $commandData['timestamp']
        ];
        
        echo "收到玩家 {$playerId} 帧 {$frame} 的命令: {$commandData['command']}\n";
        return true;
    }
    
    /**
     * 服务器主循环
     */
    public function update() {
        $currentTime = microtime(true);
        $elapsed = $currentTime - $this->lastFrameTime;
        
        // 检查是否应该推进帧
        if ($elapsed >= $this->frameInterval) {
            $targetFrame = $this->currentFrame + 1;
            
            if ($this->canAdvanceToFrame($targetFrame)) {
                $this->advanceToFrame($targetFrame);
                $this->lastFrameTime = $currentTime;
                return true;
            } else {
                echo "帧 {$targetFrame} 等待命令中...\n";
                // 可以在这里实现超时机制
            }
        }
        
        return false;
    }
    
    /**
     * 检查是否可以推进到指定帧
     */
    private function canAdvanceToFrame($frame) {
        if (!isset($this->pendingCommands[$frame])) {
            return false;
        }
        
        // 检查是否所有已连接玩家都发送了命令
        $connectedPlayers = array_filter($this->clients, function($client) {
            return $client['status'] === 'connected';
        });
        
        foreach ($connectedPlayers as $client) {
            $playerId = $client['player_id'];
            if (!isset($this->pendingCommands[$frame][$playerId])) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 推进到指定帧
     */
    private function advanceToFrame($frame) {
        // 获取该帧的所有命令
        $frameCommands = $this->pendingCommands[$frame];
        
        // 广播命令给所有客户端
        $this->broadcastFrameCommands($frame, $frameCommands);
        
        // 更新当前帧
        $this->currentFrame = $frame;
        $this->frameCommands[$frame] = $frameCommands;
        
        // 清理旧的命令数据
        $this->cleanupOldCommands();
        
        echo "推进到帧 {$frame}, 包含 " . count($frameCommands) . " 个命令\n";
    }
    
    /**
     * 广播帧命令给所有客户端
     */
    private function broadcastFrameCommands($frame, $commands) {
        $frameData = [
            'frame' => $frame,
            'commands' => $commands,
            'timestamp' => microtime(true)
        ];
        
        foreach ($this->clients as $clientId => $client) {
            $this->sendToClient($clientId, 'frame_commands', $frameData);
        }
    }
    
    /**
     * 清理旧的命令数据
     */
    private function cleanupOldCommands() {
        $framesToKeep = 120; // 保留120帧用于断线重连
        
        foreach ($this->pendingCommands as $frame => $commands) {
            if ($frame < $this->currentFrame - $framesToKeep) {
                unset($this->pendingCommands[$frame]);
            }
        }
        
        foreach ($this->frameCommands as $frame => $commands) {
            if ($frame < $this->currentFrame - $framesToKeep) {
                unset($this->frameCommands[$frame]);
            }
        }
    }
    
    /**
     * 处理客户端状态校验
     */
    public function receiveStateChecksum($clientId, $frame, $checksum) {
        if (!isset($this->clients[$clientId])) {
            return false;
        }
        
        $playerId = $this->clients[$clientId]['player_id'];
        
        // 更新客户端最后确认的帧
        $this->clients[$clientId]['last_confirmed_frame'] = $frame;
        
        echo "玩家 {$playerId} 确认帧 {$frame} 状态, 校验和: {$checksum}\n";
        
        // 这里可以添加状态一致性验证
        return true;
    }
    
    /**
     * 处理断线重连
     */
    public function handleClientReconnect($clientId, $lastKnownFrame) {
        if (!isset($this->clients[$clientId])) {
            return false;
        }
        
        $client = &$this->clients[$clientId];
        $client['status'] = 'connected';
        $client['last_heartbeat'] = microtime(true);
        
        // 发送缺失的帧命令
        $catchUpData = $this->getCatchUpData($lastKnownFrame);
        
        $this->sendToClient($clientId, 'catch_up', $catchUpData);
        
        echo "玩家 {$client['player_id']} 重新连接, 从帧 {$lastKnownFrame} 追赶\n";
        return true;
    }
    
    /**
     * 获取追赶数据
     */
    private function getCatchUpData($lastKnownFrame) {
        $missingFrames = [];
        
        for ($frame = $lastKnownFrame + 1; $frame <= $this->currentFrame; $frame++) {
            if (isset($this->frameCommands[$frame])) {
                $missingFrames[$frame] = $this->frameCommands[$frame];
            }
        }
        
        return [
            'from_frame' => $lastKnownFrame + 1,
            'to_frame' => $this->currentFrame,
            'commands' => $missingFrames,
            'current_frame' => $this->currentFrame
        ];
    }
    
    /**
     * 获取同步数据（新客户端）
     */
    private function getSyncData($clientId) {
        return [
            'current_frame' => $this->currentFrame,
            'frame_interval' => $this->frameInterval,
            'initial_commands' => array_slice($this->frameCommands, -10, 10, true) // 最近10帧
        ];
    }
    
    /**
     * 发送数据到客户端
     */
    private function sendToClient($clientId, $type, $data) {
        // 实际网络发送逻辑
        echo "发送到客户端 {$clientId}: {$type}\n";
    }
    
    /**
     * 获取服务器状态
     */
    public function getStatus() {
        return [
            'current_frame' => $this->currentFrame,
            'connected_clients' => count($this->clients),
            'pending_frames' => array_keys($this->pendingCommands)
        ];
    }
}

?>
```

### 锁步客户端

```php
<?php

/**
 * 锁步协议客户端
 */
class LockstepClient {
    private $playerId;
    private $server;
    private $currentFrame;
    private $gameEngine;
    private $pendingCommands;
    private $confirmedFrames;
    private $clientId;
    private $frameInterval;
    private $lastFrameTime;
    
    public function __construct($playerId, $server, $frameRate = 10) {
        $this->playerId = $playerId;
        $this->server = $server;
        $this->currentFrame = 0;
        $this->gameEngine = new DeterministicGameEngine();
        $this->pendingCommands = [];
        $this->confirmedFrames = [];
        $this->clientId = "client_{$playerId}";
        $this->frameInterval = 1.0 / $frameRate;
        $this->lastFrameTime = microtime(true);
        
        // 连接服务器
        $this->connectToServer();
    }
    
    /**
     * 连接到服务器
     */
    private function connectToServer() {
        $syncData = $this->server->handleClientConnect($this->clientId, [
            'player_id' => $this->playerId
        ]);
        
        $this->currentFrame = $syncData['current_frame'];
        $this->frameInterval = $syncData['frame_interval'];
        
        // 执行初始命令以同步状态
        if (!empty($syncData['initial_commands'])) {
            foreach ($syncData['initial_commands'] as $frame => $commands) {
                $this->gameEngine->executeFrame($frame, $commands);
            }
        }
        
        echo "客户端 {$this->playerId} 已连接, 当前帧: {$this->currentFrame}\n";
    }
    
    /**
     * 发送玩家命令
     */
    public function sendCommand($commandType, $commandData) {
        $targetFrame = $this->currentFrame + 1;
        
        $command = [
            'command' => $commandType,
            'data' => $commandData,
            'timestamp' => microtime(true),
            'player_id' => $this->playerId
        ];
        
        $command['checksum'] = $this->calculateCommandChecksum($command);
        
        // 存储本地命令
        if (!isset($this->pendingCommands[$targetFrame])) {
            $this->pendingCommands[$targetFrame] = [];
        }
        $this->pendingCommands[$targetFrame][$this->playerId] = $command;
        
        // 发送到服务器
        $this->server->receiveClientCommand($this->clientId, [
            'frame' => $targetFrame,
            'command' => $commandType,
            'data' => $commandData,
            'checksum' => $command['checksum'],
            'timestamp' => $command['timestamp']
        ]);
        
        echo "玩家 {$this->playerId} 发送命令: {$commandType} for frame {$targetFrame}\n";
    }
    
    /**
     * 客户端更新循环
     */
    public function update() {
        $currentTime = microtime(true);
        
        // 发送待处理的命令
        $this->sendPendingCommands();
        
        // 检查并执行已确认的帧
        $this->executeConfirmedFrames();
        
        // 发送状态校验和
        $this->sendStateChecksum();
        
        $this->lastFrameTime = $currentTime;
    }
    
    /**
     * 发送待处理的命令
     */
    private function sendPendingCommands() {
        foreach ($this->pendingCommands as $frame => $commands) {
            // 只发送尚未确认的帧命令
            if (!isset($this->confirmedFrames[$frame]) && $frame > $this->currentFrame) {
                foreach ($commands as $playerId => $command) {
                    if ($playerId === $this->playerId) {
                        // 已经发送过了，这里可以重传
                    }
                }
            }
        }
    }
    
    /**
     * 执行已确认的帧
     */
    private function executeConfirmedFrames() {
        ksort($this->confirmedFrames);
        
        foreach ($this->confirmedFrames as $frame => $frameCommands) {
            if ($frame > $this->currentFrame) {
                echo "客户端 {$this->playerId} 执行帧 {$frame}\n";
                
                // 使用确定性逻辑执行这一帧
                $this->gameEngine->executeFrame($frame, $frameCommands);
                
                $this->currentFrame = $frame;
                
                // 移除已执行的命令
                unset($this->pendingCommands[$frame]);
                unset($this->confirmedFrames[$frame]);
                
                // 更新渲染状态
                $this->updateRenderState();
            }
        }
    }
    
    /**
     * 接收服务器帧命令
     */
    public function receiveFrameCommands($frameData) {
        $frame = $frameData['frame'];
        $commands = $frameData['commands'];
        
        // 验证命令完整性
        if ($this->validateFrameCommands($frame, $commands)) {
            $this->confirmedFrames[$frame] = $commands;
            echo "客户端 {$this->playerId} 确认帧 {$frame} 命令\n";
        } else {
            echo "客户端 {$this->playerId} 帧 {$frame} 命令验证失败\n";
            // 请求重传或采取其他恢复措施
        }
    }
    
    /**
     * 接收追赶数据
     */
    public function receiveCatchUpData($catchUpData) {
        $fromFrame = $catchUpData['from_frame'];
        $toFrame = $catchUpData['to_frame'];
        $commands = $catchUpData['commands'];
        
        echo "客户端 {$this->playerId} 开始追赶: 帧 {$fromFrame} → {$toFrame}\n";
        
        // 快速执行缺失的帧
        for ($frame = $fromFrame; $frame <= $toFrame; $frame++) {
            if (isset($commands[$frame])) {
                $this->gameEngine->executeFrame($frame, $commands[$frame]);
                echo "客户端 {$this->playerId} 追赶执行帧 {$frame}\n";
            }
        }
        
        $this->currentFrame = $toFrame;
        $this->updateRenderState();
        
        echo "客户端 {$this->playerId} 追赶完成, 当前帧: {$toFrame}\n";
    }
    
    /**
     * 验证帧命令
     */
    private function validateFrameCommands($frame, $commands) {
        // 检查命令数量
        $expectedPlayers = ['player1', 'player2']; // 应从服务器获取
        
        foreach ($expectedPlayers as $playerId) {
            if (!isset($commands[$playerId])) {
                return false;
            }
        }
        
        // 验证命令校验和
        foreach ($commands as $playerId => $command) {
            $calculatedChecksum = $this->calculateCommandChecksum($command);
            if ($calculatedChecksum !== $command['checksum']) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 发送状态校验和
     */
    private function sendStateChecksum() {
        // 定期发送状态校验和（例如每10帧）
        if ($this->currentFrame % 10 === 0) {
            $stateChecksum = $this->gameEngine->getStateChecksum();
            $this->server->receiveStateChecksum(
                $this->clientId, 
                $this->currentFrame, 
                $stateChecksum
            );
        }
    }
    
    /**
     * 计算命令校验和
     */
    private function calculateCommandChecksum($command) {
        $dataToHash = $command['command'] . json_encode($command['data']) . $command['timestamp'];
        return md5($dataToHash);
    }
    
    /**
     * 更新渲染状态
     */
    private function updateRenderState() {
        // 这里更新客户端的渲染状态
        // 可以进行插值平滑处理
        $gameState = $this->gameEngine->getCurrentState();
        // 更新UI和渲染...
    }
    
    /**
     * 获取当前游戏状态
     */
    public function getGameState() {
        return $this->gameEngine->getCurrentState();
    }
    
    /**
     * 获取当前帧号
     */
    public function getCurrentFrame() {
        return $this->currentFrame;
    }
}

?>
```

### 确定性游戏引擎

```php
<?php

/**
 * 确定性游戏引擎
 */
class DeterministicGameEngine {
    private $gameState;
    private $randomSeed;
    
    public function __construct($seed = 12345) {
        $this->randomSeed = $seed;
        $this->gameState = [
            'units' => [],
            'players' => [],
            'resources' => [],
            'frame' => 0
        ];
        
        $this->initializeGameState();
    }
    
    /**
     * 初始化游戏状态
     */
    private function initializeGameState() {
        // 初始化玩家
        $this->gameState['players'] = [
            'player1' => [
                'id' => 'player1',
                'resources' => ['gold' => 1000, 'wood' => 500],
                'base_position' => ['x' => 0, 'y' => 0]
            ],
            'player2' => [
                'id' => 'player2', 
                'resources' => ['gold' => 1000, 'wood' => 500],
                'base_position' => ['x' => 100, 'y' => 100]
            ]
        ];
        
        // 初始化单位
        $this->gameState['units'] = [
            'unit_1' => [
                'id' => 'unit_1',
                'owner' => 'player1',
                'type' => 'worker',
                'position' => ['x' => 10, 'y' => 10],
                'health' => 100,
                'state' => 'idle'
            ],
            'unit_2' => [
                'id' => 'unit_2',
                'owner' => 'player2', 
                'type' => 'worker',
                'position' => ['x' => 90, 'y' => 90],
                'health' => 100,
                'state' => 'idle'
            ]
        ];
    }
    
    /**
     * 执行一帧游戏逻辑
     */
    public function executeFrame($frame, $commands) {
        // 设置确定性随机种子
        srand($this->randomSeed + $frame);
        
        // 处理所有命令
        $this->processCommands($frame, $commands);
        
        // 更新游戏逻辑
        $this->updateGameLogic($frame);
        
        // 生成帧校验和
        $this->generateFrameChecksum($frame);
        
        $this->gameState['frame'] = $frame;
    }
    
    /**
     * 处理命令
     */
    private function processCommands($frame, $commands) {
        foreach ($commands as $playerId => $commandData) {
            $command = $commandData['command'];
            $data = $commandData['data'];
            
            switch ($command) {
                case 'move_unit':
                    $this->handleMoveUnit($playerId, $data);
                    break;
                    
                case 'train_unit':
                    $this->handleTrainUnit($playerId, $data);
                    break;
                    
                case 'gather_resource':
                    $this->handleGatherResource($playerId, $data);
                    break;
                    
                case 'attack':
                    $this->handleAttack($playerId, $data);
                    break;
                    
                default:
                    echo "未知命令: {$command}\n";
            }
        }
    }
    
    /**
     * 处理移动单位命令
     */
    private function handleMoveUnit($playerId, $data) {
        $unitId = $data['unit_id'];
        $targetX = $data['target_x'];
        $targetY = $data['target_y'];
        
        if (isset($this->gameState['units'][$unitId])) {
            $unit = &$this->gameState['units'][$unitId];
            
            // 验证单位所有权
            if ($unit['owner'] !== $playerId) {
                echo "错误: 玩家 {$playerId} 试图移动不属于自己的单位 {$unitId}\n";
                return;
            }
            
            $unit['target_position'] = ['x' => $targetX, 'y' => $targetY];
            $unit['state'] = 'moving';
            
            echo "单位 {$unitId} 开始移动到 ({$targetX}, {$targetY})\n";
        }
    }
    
    /**
     * 处理训练单位命令
     */
    private function handleTrainUnit($playerId, $data) {
        $unitType = $data['unit_type'];
        $buildingId = $data['building_id'];
        
        $cost = $this->getUnitCost($unitType);
        $player = &$this->gameState['players'][$playerId];
        
        // 检查资源是否足够
        if ($player['resources']['gold'] >= $cost['gold'] && 
            $player['resources']['wood'] >= $cost['wood']) {
            
            // 扣除资源
            $player['resources']['gold'] -= $cost['gold'];
            $player['resources']['wood'] -= $cost['wood'];
            
            // 创建新单位
            $unitId = "unit_" . uniqid();
            $spawnPosition = $this->getSpawnPosition($playerId);
            
            $this->gameState['units'][$unitId] = [
                'id' => $unitId,
                'owner' => $playerId,
                'type' => $unitType,
                'position' => $spawnPosition,
                'health' => $this->getUnitHealth($unitType),
                'state' => 'idle'
            ];
            
            echo "玩家 {$playerId} 训练了 {$unitType} ({$unitId})\n";
        } else {
            echo "玩家 {$playerId} 资源不足，无法训练 {$unitType}\n";
        }
    }
    
    /**
     * 处理采集资源命令
     */
    private function handleGatherResource($playerId, $data) {
        $unitId = $data['unit_id'];
        $resourceId = $data['resource_id'];
        
        if (isset($this->gameState['units'][$unitId])) {
            $unit = &$this->gameState['units'][$unitId];
            $unit['state'] = 'gathering';
            $unit['target_resource'] = $resourceId;
            
            echo "单位 {$unitId} 开始采集资源 {$resourceId}\n";
        }
    }
    
    /**
     * 处理攻击命令
     */
    private function handleAttack($playerId, $data) {
        $attackerId = $data['attacker_id'];
        $targetId = $data['target_id'];
        
        if (isset($this->gameState['units'][$attackerId]) && 
            isset($this->gameState['units'][$targetId])) {
            
            $attacker = &$this->gameState['units'][$attackerId];
            $target = &$this->gameState['units'][$targetId];
            
            // 验证所有权
            if ($attacker['owner'] !== $playerId) {
                echo "错误: 玩家 {$playerId} 试图用不属于自己的单位攻击\n";
                return;
            }
            
            $attacker['state'] = 'attacking';
            $attacker['attack_target'] = $targetId;
            
            echo "单位 {$attackerId} 开始攻击单位 {$targetId}\n";
        }
    }
    
    /**
     * 更新游戏逻辑
     */
    private function updateGameLogic($frame) {
        // 更新单位状态
        $this->updateUnits($frame);
        
        // 处理战斗
        $this->updateCombat($frame);
        
        // 更新资源
        $this->updateResources($frame);
    }
    
    /**
     * 更新单位状态
     */
    private function updateUnits($frame) {
        foreach ($this->gameState['units'] as &$unit) {
            switch ($unit['state']) {
                case 'moving':
                    $this->updateUnitMovement($unit);
                    break;
                    
                case 'attacking':
                    $this->updateUnitAttack($unit, $frame);
                    break;
                    
                case 'gathering':
                    $this->updateUnitGathering($unit, $frame);
                    break;
            }
        }
    }
    
    /**
     * 更新单位移动
     */
    private function updateUnitMovement(&$unit) {
        if (!isset($unit['target_position'])) {
            return;
        }
        
        $speed = 2.0; // 移动速度
        $currentPos = $unit['position'];
        $targetPos = $unit['target_position'];
        
        $dx = $targetPos['x'] - $currentPos['x'];
        $dy = $targetPos['y'] - $currentPos['y'];
        $distance = sqrt($dx * $dx + $dy * $dy);
        
        if ($distance <= $speed) {
            // 到达目标
            $unit['position'] = $targetPos;
            $unit['state'] = 'idle';
            unset($unit['target_position']);
        } else {
            // 移动
            $unit['position']['x'] += ($dx / $distance) * $speed;
            $unit['position']['y'] += ($dy / $distance) * $speed;
        }
    }
    
    /**
     * 更新单位攻击
     */
    private function updateUnitAttack(&$unit, $frame) {
        if (!isset($unit['attack_target'])) {
            $unit['state'] = 'idle';
            return;
        }
        
        $targetId = $unit['attack_target'];
        if (!isset($this->gameState['units'][$targetId])) {
            $unit['state'] = 'idle';
            unset($unit['attack_target']);
            return;
        }
        
        $target = &$this->gameState['units'][$targetId];
        
        // 每30帧攻击一次
        if ($frame % 30 === 0) {
            $damage = $this->getUnitDamage($unit['type']);
            $target['health'] -= $damage;
            
            echo "单位 {$unit['id']} 攻击 {$targetId}, 造成 {$damage} 伤害\n";
            
            if ($target['health'] <= 0) {
                echo "单位 {$targetId} 被摧毁\n";
                unset($this->gameState['units'][$targetId]);
                $unit['state'] = 'idle';
                unset($unit['attack_target']);
            }
        }
    }
    
    /**
     * 更新单位采集
     */
    private function updateUnitGathering(&$unit, $frame) {
        // 每60帧采集一次资源
        if ($frame % 60 === 0) {
            $player = &$this->gameState['players'][$unit['owner']];
            $player['resources']['gold'] += 10;
            
            echo "单位 {$unit['id']} 采集了 10 黄金\n";
        }
    }
    
    /**
     * 更新战斗逻辑
     */
    private function updateCombat($frame) {
        // 处理近战单位的碰撞检测等
    }
    
    /**
     * 更新资源逻辑
     */
    private function updateResources($frame) {
        // 处理资源再生等
    }
    
    // 辅助方法
    private function getUnitCost($unitType) {
        $costs = [
            'worker' => ['gold' => 50, 'wood' => 0],
            'soldier' => ['gold' => 100, 'wood' => 25],
            'archer' => ['gold' => 75, 'wood' => 50]
        ];
        
        return $costs[$unitType] ?? ['gold' => 0, 'wood' => 0];
    }
    
    private function getUnitHealth($unitType) {
        $health = [
            'worker' => 100,
            'soldier' => 150,
            'archer' => 80
        ];
        
        return $health[$unitType] ?? 100;
    }
    
    private function getUnitDamage($unitType) {
        $damage = [
            'worker' => 5,
            'soldier' => 15,
            'archer' => 10
        ];
        
        return $damage[$unitType] ?? 10;
    }
    
    private function getSpawnPosition($playerId) {
        $basePos = $this->gameState['players'][$playerId]['base_position'];
        return [
            'x' => $basePos['x'] + rand(-10, 10),
            'y' => $basePos['y'] + rand(-10, 10)
        ];
    }
    
    /**
     * 生成帧校验和
     */
    private function generateFrameChecksum($frame) {
        $stateString = serialize($this->gameState);
        $checksum = md5($stateString);
        
        echo "帧 {$frame} 状态校验和: {$checksum}\n";
        return $checksum;
    }
    
    /**
     * 获取状态校验和
     */
    public function getStateChecksum() {
        return md5(serialize($this->gameState));
    }
    
    /**
     * 获取当前游戏状态
     */
    public function getCurrentState() {
        return $this->gameState;
    }
}

?>
```

## 应用示例与测试

```php
<?php

class LockstepExamples {
    
    /**
     * 基础锁步演示
     */
    public static function basicLockstepDemo() {
        echo "=== 锁步协议基础演示 ===\n";
        
        // 创建锁步服务器
        $server = new LockstepServer(2); // 2Hz 帧率
        
        // 创建两个客户端
        $client1 = new LockstepClient('player1', $server, 2);
        $client2 = new LockstepClient('player2', $server, 2);
        
        // 模拟游戏循环
        for ($i = 0; $i < 10; $i++) {
            echo "\n--- 时间点 {$i} ---\n";
            
            // 客户端发送命令
            if ($i % 3 == 0) {
                $client1->sendCommand('move_unit', [
                    'unit_id' => 'unit_1',
                    'target_x' => 20 + $i * 5,
                    'target_y' => 20 + $i * 5
                ]);
            }
            
            if ($i % 4 == 0) {
                $client2->sendCommand('move_unit', [
                    'unit_id' => 'unit_2', 
                    'target_x' => 80 - $i * 5,
                    'target_y' => 80 - $i * 5
                ]);
            }
            
            // 客户端更新
            $client1->update();
            $client2->update();
            
            // 服务器更新
            $server->update();
            
            // 显示状态
            $frame1 = $client1->getCurrentFrame();
            $frame2 = $client2->getCurrentFrame();
            $state1 = $client1->getGameState();
            
            echo "客户端1帧: {$frame1}, 客户端2帧: {$frame2}\n";
            
            $unit1 = $state1['units']['unit_1'] ?? null;
            $unit2 = $state1['units']['unit_2'] ?? null;
            
            if ($unit1) {
                echo "单位1位置: ({$unit1['position']['x']}, {$unit1['position']['y']})\n";
            }
            if ($unit2) {
                echo "单位2位置: ({$unit2['position']['x']}, {$unit2['position']['y']})\n";
            }
            
            usleep(500000); // 500ms
        }
    }
    
    /**
     * 断线重连演示
     */
    public static function reconnectDemo() {
        echo "\n=== 断线重连演示 ===\n";
        
        $server = new LockstepServer(2);
        $client1 = new LockstepClient('player1', $server, 2);
        
        // 模拟一些游戏进行
        for ($i = 0; $i < 5; $i++) {
            $client1->sendCommand('move_unit', [
                'unit_id' => 'unit_1',
                'target_x' => 10 + $i * 10,
                'target_y' => 10 + $i * 10
            ]);
            
            $client1->update();
            $server->update();
            usleep(500000);
        }
        
        echo "玩家1断线...\n";
        // 模拟断线
        
        echo "玩家1重新连接...\n";
        $server->handleClientReconnect('client_player1', 3); // 从帧3开始追赶
        
        // 创建新客户端实例（模拟重连）
        $client1Reconnected = new LockstepClient('player1', $server, 2);
        
        echo "重连后当前帧: " . $client1Reconnected->getCurrentFrame() . "\n";
    }
    
    /**
     * 性能测试
     */
    public static function performanceTest() {
        echo "\n=== 锁步协议性能测试 ===\n";
        
        $server = new LockstepServer(10); // 10Hz
        
        // 创建多个客户端
        $clients = [];
        for ($i = 1; $i <= 4; $i++) {
            $clients[] = new LockstepClient("player{$i}", $server, 10);
        }
        
        $startTime = microtime(true);
        $frameCount = 100;
        
        for ($frame = 0; $frame < $frameCount; $frame++) {
            // 每个客户端发送命令
            foreach ($clients as $client) {
                $client->sendCommand('move_unit', [
                    'unit_id' => 'unit_1',
                    'target_x' => rand(0, 100),
                    'target_y' => rand(0, 100)
                ]);
            }
            
            // 更新
            foreach ($clients as $client) {
                $client->update();
            }
            $server->update();
        }
        
        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;
        
        echo "执行 {$frameCount} 帧耗时: " . number_format($executionTime, 2) . "秒\n";
        echo "平均帧率: " . number_format($frameCount / $executionTime, 2) . " Hz\n";
        echo "理论帧率: 10 Hz\n";
    }
    
    /**
     * 确定性验证测试
     */
    public static function determinismTest() {
        echo "\n=== 确定性验证测试 ===\n";
        
        // 创建两个完全相同的游戏引擎
        $engine1 = new DeterministicGameEngine(12345);
        $engine2 = new DeterministicGameEngine(12345);
        
        $commands = [
            'player1' => [
                'command' => 'move_unit',
                'data' => ['unit_id' => 'unit_1', 'target_x' => 50, 'target_y' => 50]
            ],
            'player2' => [
                'command' => 'move_unit', 
                'data' => ['unit_id' => 'unit_2', 'target_x' => 60, 'target_y' => 60]
            ]
        ];
        
        // 在两个引擎上执行相同的命令
        $engine1->executeFrame(1, $commands);
        $engine2->executeFrame(1, $commands);
        
        $state1 = $engine1->getCurrentState();
        $state2 = $engine2->getCurrentState();
        
        $checksum1 = $engine1->getStateChecksum();
        $checksum2 = $engine2->getStateChecksum();
        
        echo "引擎1校验和: {$checksum1}\n";
        echo "引擎2校验和: {$checksum2}\n";
        
        if ($checksum1 === $checksum2) {
            echo "✓ 确定性验证通过 - 两个引擎状态一致\n";
        } else {
            echo "✗ 确定性验证失败 - 状态不一致\n";
        }
    }
}

// 运行演示
LockstepExamples::basicLockstepDemo();
LockstepExamples::reconnectDemo();
LockstepExamples::performanceTest();
LockstepExamples::determinismTest();

?>
```

## 高级优化技术

### 1. 时间扭曲(Time Warp)

```php
<?php

/**
 * 带时间扭曲的锁步客户端
 * 允许客户端乐观执行，发生冲突时回滚
 */
class TimeWarpLockstepClient extends LockstepClient {
    private $stateHistory;
    private $rollbackFrames;
    
    public function __construct($playerId, $server, $frameRate = 10) {
        parent::__construct($playerId, $server, $frameRate);
        $this->stateHistory = [];
        $this->rollbackFrames = 0;
    }
    
    /**
     * 乐观执行帧（可能回滚）
     */
    public function executeFrameOptimistic($frame, $commands) {
        // 保存当前状态
        $this->saveState($frame);
        
        // 执行帧
        $this->gameEngine->executeFrame($frame, $commands);
        
        $this->currentFrame = $frame;
        echo "客户端 {$this->playerId} 乐观执行帧 {$frame}\n";
    }
    
    /**
     * 保存状态历史
     */
    private function saveState($frame) {
        $this->stateHistory[$frame] = [
            'state' => serialize($this->gameEngine->getCurrentState()),
            'checksum' => $this->gameEngine->getStateChecksum()
        ];
        
        // 限制历史大小
        if (count($this->stateHistory) > 60) {
            $oldestFrame = min(array_keys($this->stateHistory));
            unset($this->stateHistory[$oldestFrame]);
        }
    }
    
    /**
     * 回滚到指定帧
     */
    public function rollbackToFrame($targetFrame) {
        if (!isset($this->stateHistory[$targetFrame])) {
            echo "错误: 无法回滚到帧 {$targetFrame}，状态历史不存在\n";
            return false;
        }
        
        // 恢复状态
        $savedState = unserialize($this->stateHistory[$targetFrame]['state']);
        $this->gameEngine->restoreState($savedState);
        
        $this->currentFrame = $targetFrame;
        $this->rollbackFrames++;
        
        echo "客户端 {$this->playerId} 回滚到帧 {$targetFrame}\n";
        return true;
    }
    
    /**
     * 从指定帧重新执行
     */
    public function reexecuteFromFrame($startFrame, $commandsHistory) {
        $this->rollbackToFrame($startFrame);
        
        // 重新执行所有帧
        for ($frame = $startFrame + 1; $frame <= $this->currentFrame; $frame++) {
            if (isset($commandsHistory[$frame])) {
                $this->gameEngine->executeFrame($frame, $commandsHistory[$frame]);
            }
        }
        
        echo "客户端 {$this->playerId} 从帧 {$startFrame} 重新执行完成\n";
    }
}

?>
```

### 2. 预测与调和

```php
<?php

/**
 * 带预测的锁步客户端
 */
class PredictiveLockstepClient extends LockstepClient {
    private $predictedFrames;
    private $predictionEngine;
    
    public function __construct($playerId, $server, $frameRate = 10) {
        parent::__construct($playerId, $server, $frameRate);
        $this->predictedFrames = [];
        $this->predictionEngine = new DeterministicGameEngine();
    }
    
    /**
     * 预测执行未来帧
     */
    public function predictFrames($currentFrame, $localCommands, $predictedEnemyCommands = []) {
        $this->predictionEngine->restoreState($this->gameEngine->getCurrentState());
        
        $predictions = [];
        $framesToPredict = 3; // 预测3帧
        
        for ($frame = $currentFrame + 1; $frame <= $currentFrame + $framesToPredict; $frame++) {
            $commands = [];
            
            // 添加本地命令预测
            if (isset($localCommands[$frame])) {
                $commands[$this->playerId] = $localCommands[$frame];
            }
            
            // 添加敌方命令预测（基于AI或历史行为）
            foreach ($predictedEnemyCommands as $playerId => $playerCommands) {
                if (isset($playerCommands[$frame])) {
                    $commands[$playerId] = $playerCommands[$frame];
                }
            }
            
            if (!empty($commands)) {
                $this->predictionEngine->executeFrame($frame, $commands);
                $predictions[$frame] = $this->predictionEngine->getCurrentState();
            }
        }
        
        return $predictions;
    }
    
    /**
     * 与服务器状态调和
     */
    public function reconcileWithServer($serverState, $frame) {
        $localState = $this->gameEngine->getCurrentState();
        $localChecksum = $this->gameEngine->getStateChecksum();
        $serverChecksum = $serverState['checksum'];
        
        if ($localChecksum !== $serverChecksum) {
            echo "客户端 {$this->playerId} 状态不一致，进行调和\n";
            
            // 采用服务器状态
            $this->gameEngine->restoreState($serverState['state']);
            $this->currentFrame = $frame;
            
            return true;
        }
        
        return false;
    }
}

?>
```

## 实际应用场景

### RTS游戏同步
```php
class RTSGameSync {
    private $lockstepServer;
    private $clients;
    
    public function __construct($playerCount, $frameRate = 16) {
        $this->lockstepServer = new LockstepServer($frameRate);
        $this->clients = [];
        
        for ($i = 1; $i <= $playerCount; $i++) {
            $this->clients[] = new LockstepClient("player{$i}", $this->lockstepServer, $frameRate);
        }
    }
    
    public function handleGameCommand($playerId, $command) {
        foreach ($this->clients as $client) {
            if ($client->getPlayerId() === $playerId) {
                $client->sendCommand($command['type'], $command['data']);
                break;
            }
        }
    }
}
```

### 回合制策略游戏
```php
class TurnBasedGameSync extends LockstepServer {
    // 锁步协议也适用于回合制游戏
    // 每个"帧"代表一个回合
}
```

## 总结

锁步协议是RTS游戏网络同步的黄金标准：

### 核心优势

1. **极低带宽**：只同步玩家命令，不同步游戏状态
2. **完美同步**：所有客户端产生完全相同的结果
3. **可预测性**：支持回放、观战、调试功能
4. **安全性**：游戏逻辑在客户端运行，服务端只转发命令

### 适用场景

- ✅ 实时战略游戏(RTS)
- ✅ 回合制策略游戏
- ✅ 需要精确同步的多人在线游戏
- ✅ 支持回放和观战功能的游戏

### 关键技术挑战

1. **确定性保证**：
   - 固定随机数种子
   - 避免浮点数不确定性
   - 统一计算精度

2. **网络延迟处理**：
   - 命令缓冲
   - 预测执行
   - 时间扭曲

3. **断线恢复**：
   - 命令历史记录
   - 状态快照
   - 快速重新同步

### 最佳实践

1. **帧率选择**：
   - RTS游戏：8-16Hz
   - 动作游戏：16-30Hz
   - 根据网络条件动态调整

2. **命令优化**：
   - 命令压缩
   - 差分编码
   - 优先级排序

3. **状态验证**：
   - 定期校验和检查
   - 自动错误恢复
   - 详细的调试日志

锁步协议通过其优雅的设计和强大的同步能力，为复杂的多人在线游戏提供了可靠的网络同步基础。理解并正确实现锁步协议，是开发高质量多人游戏的关键。