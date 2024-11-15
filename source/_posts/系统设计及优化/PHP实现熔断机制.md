---
title: PHP实现熔断机制
tags: [PHP,熔断]
categories: [系统设计]
abbrlink: 'php-circuit-breaker'
date: 2024-11-13 13:39:12
updated: 2024-11-13 13:39:12
---

### 什么是熔断机制？
熔断机制是一种应对系统故障、防止级联故障的保护机制。当某个服务出现故障时，通过熔断机制，可以快速隔离故障服务，防止故障蔓延到整个系统，从而保证系统的稳定性。

### 熔断机制的核心要素
 - 快速失败： 当服务不可用时，立即返回错误，防止请求积压。
 - 隔离： 将故障服务隔离，防止影响其他服务。
 - 自恢复： 经过一段时间后，自动尝试恢复服务，并逐步增加流量。
 - 监控： 实时监控服务状态，及时发现异常。

### 熔断机制的应用场景
 - 微服务架构： 防止单个服务的故障影响整个系统。
 - 分布式系统： 提高系统的容错性。
 - 高并发系统： 保护系统在高并发下的稳定性。

### 实现熔断器的基本思路
 - 定义状态: 闭合状态（正常调用）、半开状态（部分调用）、打开状态（完全阻断）。
 - 统计请求: 记录成功和失败的请求次数。
 - 设置阈值: 当失败次数达到一定阈值时，触发熔断。
 - 状态切换: 根据当前状态和统计数据，实现状态之间的切换。

### PHP代码实现熔断器
```php
class CircuitBreaker
{
    private const CLOSED = 'CLOSED';
    private const OPEN = 'OPEN';
    private const HALF_OPEN = 'HALF_OPEN';

    private $state = self::CLOSED;
    private $failureThreshold = 0.5;      // 失败率阈值
    private $windowSize = 10;           // 滑动窗口大小
    private $timeout = 3;               // 半开状态超时时间
    private $window = [];
    private $lastCheckedAt;


    public function call($callback)
    {
        if ($this->state === self::OPEN && time() - $this->lastCheckedAt < $this->timeout) {
            return false;       //直接返回失败
        }

        try {
            $result = $callback();
            $this->recordSuccess();
        } catch (\Exception $e) {
            $this->recordFailure();
            if ($this->isTripped()){
                $this->state = self::OPEN;
                $this->lastCheckedAt = time();
            }
            return false;
        }

        if ($this->state === self::HALF_OPEN) {
            $this->state = ($this->isTripped()) ? self::OPEN : self::CLOSED;
        }

        return $result;
    }

    private function recordSuccess()
    {
        $this->window[] = 'success';
        if (count($this->window) > $this->windowSize) {
            array_shift($this->window);
        }
    }

    private function recordFailure()
    {
        $this->window[] = 'failure';
        if (count($this->window) > $this->windowSize) {
            array_shift($this->window);
        }
    }

    private function isTripped()
    {
        $failures = array_count_values($this->window)['failure'] ?? 0;
        return $failures / $this->windowSize > $this->failureThreshold;
    }

    public function getSystemLoad()
    {
        return sys_getloadavg()[0];
    }

    // 自适应阈值示例（基于负载）
    public function adjustThreshold($load)
    {
        // 根据负载调整阈值，例如：
        if ($load > 80) {
            $this->failureThreshold = 0.3; // 负载高时，降低阈值
        } else {
            $this->failureThreshold = 0.5;
        }
    }
}


// 调用
$circuitBreaker = new CircuitBreaker();

while (true) {
    // 定期获取系统负载并调整阈值
    $load = $circuitBreaker->getSystemLoad();
    $circuitBreaker->adjustThreshold($load);

    // 调用服务
    $result = $circuitBreaker->call(function () {
        // ...
    });

    // ... 其他逻辑
}
```

### 注意事项
 - 阈值设置： 阈值设置过高，可能导致服务长时间不可用；设置过低，可能频繁触发熔断。
 - 超时时间: 超时时间过短，可能导致服务频繁切换状态；过长，可能影响服务恢复。
 - 降级策略： 熔断时，需要有合适的降级策略，比如返回缓存数据、返回默认值等，保证用户体验。
 - 监控告警： 需要实时监控熔断状态，及时发现问题。