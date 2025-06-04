---
title: 熔断机制（Circuit Breaker）详解
tags: [熔断机制]
categories: [系统设计]
abbrlink: 'circuit-breaker'
date: 2025-04-11 17:24:02
updated: 2025-04-11 17:24:02
---

熔断机制是一种容错设计模式，用于防止系统在异常情况下持续恶化，避免级联故障。它类似于电路中的保险丝，在电流过大时自动断开，保护电路安全。

---

**1. 熔断机制的核心原理**
熔断机制通常有三种状态：
1. Closed（关闭状态）  
   • 正常工作，请求正常处理。

   • 如果失败率达到阈值（如 50%），则触发熔断。

2. Open（打开状态）  
   • 直接拒绝请求，不执行实际逻辑（快速失败）。

   • 经过一段时间（如 5s）后，进入 Half-Open（半开状态） 进行试探。

3. Half-Open（半开状态）  
   • 允许少量请求通过，如果成功率达到阈值（如 80%），则恢复 Closed 状态。

   • 如果失败，则重新进入 Open 状态。


---

**2. 熔断机制的用途**
1. 防止级联故障  
   • 当某个服务不可用时，熔断机制可以阻止请求继续发送，避免拖垮整个系统。

2. 提高系统稳定性  
   • 在服务异常时快速失败，避免资源耗尽（如 CPU、内存、数据库连接）。

3. 自动恢复  
   • 在服务恢复后，自动尝试恢复请求，减少人工干预。


---

**3. PHP 实现熔断机制**
我们可以用 PHP 实现一个简单的熔断器（Circuit Breaker），基于 计数器 + 状态机 的方式。

**示例代码**
```php
<?php

class CircuitBreaker {
    private $state = 'closed'; // closed, open, half-open
    private $failureThreshold = 3; // 失败阈值
    private $failureCount = 0; // 当前失败次数
    private $successThreshold = 2; // 半开状态下成功阈值
    private $halfOpenSuccessCount = 0; // 半开状态下成功次数
    private $timeout = 5; // Open 状态持续时间（秒）
    private $lastFailureTime = 0; // 上次失败时间

    public function execute(callable $operation) {
        $currentTime = time();

        // 检查是否处于 Open 状态，并判断是否超时
        if ($this->state === 'open' && ($currentTime - $this->lastFailureTime) > $this->timeout) {
            $this->state = 'half-open'; // 进入半开状态
        }

        // 根据状态决定是否执行操作
        if ($this->state === 'open') {
            throw new Exception("Circuit breaker is OPEN. Request rejected.");
        } elseif ($this->state === 'half-open') {
            try {
                $result = $operation();
                $this->halfOpenSuccessCount++;
                if ($this->halfOpenSuccessCount >= $this->successThreshold) {
                    $this->reset(); // 恢复 Closed 状态
                }
                return $result;
            } catch (Exception $e) {
                $this->trip(); // 触发熔断
                throw $e;
            }
        } else { // closed 状态
            try {
                $result = $operation();
                $this->failureCount = 0; // 重置失败计数
                return $result;
            } catch (Exception $e) {
                $this->failureCount++;
                $this->lastFailureTime = $currentTime;
                if ($this->failureCount >= $this->failureThreshold) {
                    $this->trip(); // 触发熔断
                }
                throw $e;
            }
        }
    }

    private function trip() {
        $this->state = 'open';
        $this->failureCount = 0;
        $this->halfOpenSuccessCount = 0;
    }

    private function reset() {
        $this->state = 'closed';
        $this->failureCount = 0;
        $this->halfOpenSuccessCount = 0;
    }
}

// 使用示例
$breaker = new CircuitBreaker();

try {
    $result = $breaker->execute(function () {
        // 模拟一个可能失败的操作
        if (rand(0, 1) === 0) {
            throw new Exception("Service failed!");
        }
        return "Success!";
    });
    echo $result . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
```

---

**代码解析**
1. 状态管理  
   • `closed`：正常执行请求。

   • `open`：直接拒绝请求，防止雪崩。

   • `half-open`：允许少量请求试探服务是否恢复。

2. 熔断触发条件  
   • 在 `closed` 状态下，如果失败次数超过阈值，则进入 `open` 状态。

3. 自动恢复  
   • 在 `open` 状态下，经过 `timeout` 时间后进入 `half-open` 状态。

   • 如果 `half-open` 状态下成功率达到阈值，则恢复 `closed` 状态。


---

**4. 实际应用场景**
1. 微服务调用  
   • 当某个服务不可用时，熔断机制可以防止请求堆积，保护调用方。

2. 数据库查询  
   • 如果数据库响应过慢或超时，可以触发熔断，避免拖垮整个系统。

3. API 网关  
   • 在网关层实现熔断，保护后端服务不被异常流量击垮。


---

**5. 进阶优化**
• 动态调整阈值：根据系统负载动态调整失败阈值。

• 监控与告警：记录熔断事件，方便排查问题。

• 分布式熔断：在微服务架构中，可以使用 Hystrix（Java）、Resilience4j（Java）、Sentinel（Java/Go）等框架实现分布式熔断。


---

**总结**
熔断机制是系统容错的重要手段，PHP 可以通过状态机实现简单的熔断逻辑。在实际项目中，建议使用成熟的熔断框架（如 Sentinel、Hystrix）来提高可靠性。