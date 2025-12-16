---
title: 模糊逻辑(Fuzzy Logic)：处理不确定性的智能决策艺术
tags: [PHP,算法,模糊逻辑]
categories: [算法]
abbrlink: 'fuzzy-logic'
date: 2025-11-20 10:38:21
updated: 2025-11-20 10:38:21
---

> 如何让计算机像人类一样处理"有点热"、"比较快"这类模糊概念？模糊逻辑通过引入介于0和1之间的隶属度，让机器能够理解和处理现实世界中的不确定性。

## 问题背景

在传统逻辑中，我们使用布尔值（真/假，1/0）进行决策，但现实世界充满了灰色地带：

- **温度控制**："有点热"到底是多少度？
- **自动驾驶**："比较安全"的距离是多少？
- **医疗诊断**："轻微症状"如何量化？
- **消费决策**："价格合理"的范围是什么？

传统二值逻辑无法很好地处理这些连续、模糊的概念，而模糊逻辑提供了自然的解决方案。

## 基本概念

### 核心思想

**模糊逻辑的核心是将二值逻辑扩展为多值逻辑，通过隶属度函数来描述事物属于某个模糊集合的程度。**

### 与传统逻辑对比

| 特性 | 传统逻辑 | 模糊逻辑 |
|------|----------|----------|
| 变量取值 | 0或1 | 0到1之间的连续值 |
| 逻辑运算 | AND, OR, NOT | 模糊AND, 模糊OR, 模糊NOT |
| 决策基础 | 绝对规则 | 近似推理 |
| 适用场景 | 精确控制 | 不确定性处理 |

## 模糊逻辑系统组成

一个完整的模糊逻辑系统包含四个主要部分：

### 1. 模糊化(Fuzzification)
将精确的输入值转换为模糊集合的隶属度。

### 2. 模糊规则库(Fuzzy Rule Base)
包含"如果-那么"(IF-THEN)形式的模糊规则。

### 3. 模糊推理(Fuzzy Inference)
根据模糊规则和输入隶属度进行推理。

### 4. 去模糊化(Defuzzification)
将模糊输出转换为精确的控制值。

## PHP实现

### 基础框架

```php
<?php

/**
 * 模糊集合类
 */
class FuzzySet {
    private $name;
    private $membershipFunction;
    
    public function __construct($name, $membershipFunction) {
        $this->name = $name;
        $this->membershipFunction = $membershipFunction;
    }
    
    /**
     * 计算隶属度
     */
    public function getMembership($x) {
        return call_user_func($this->membershipFunction, $x);
    }
    
    public function getName() {
        return $this->name;
    }
}

/**
 * 模糊变量类
 */
class FuzzyVariable {
    private $name;
    private $sets;
    private $min;
    private $max;
    
    public function __construct($name, $min, $max) {
        $this->name = $name;
        $this->sets = [];
        $this->min = $min;
        $this->max = $max;
    }
    
    /**
     * 添加模糊集合
     */
    public function addSet($set) {
        $this->sets[$set->getName()] = $set;
    }
    
    /**
     * 模糊化输入值
     */
    public function fuzzify($x) {
        $result = [];
        foreach ($this->sets as $name => $set) {
            $result[$name] = $set->getMembership($x);
        }
        return $result;
    }
    
    public function getRange() {
        return ['min' => $this->min, 'max' => $this->max];
    }
    
    public function getName() {
        return $this->name;
    }
}

/**
 * 模糊规则类
 */
class FuzzyRule {
    private $antecedent; // 前件（条件）
    private $consequent; // 后件（结论）
    
    public function __construct($antecedent, $consequent) {
        $this->antecedent = $antecedent;
        $this->consequent = $consequent;
    }
    
    /**
     * 评估规则
     */
    public function evaluate($inputs) {
        // 计算前件的真值（使用最小运算）
        $antecedentTruth = 1.0;
        
        foreach ($this->antecedent as $varName => $setName) {
            if (isset($inputs[$varName][$setName])) {
                $antecedentTruth = min($antecedentTruth, $inputs[$varName][$setName]);
            } else {
                $antecedentTruth = 0;
                break;
            }
        }
        
        return [
            'consequent' => $this->consequent,
            'truth' => $antecedentTruth
        ];
    }
}

/**
 * 模糊逻辑系统
 */
class FuzzyLogicSystem {
    private $inputVariables;
    private $outputVariables;
    private $rules;
    
    public function __construct() {
        $this->inputVariables = [];
        $this->outputVariables = [];
        $this->rules = [];
    }
    
    public function addInputVariable($variable) {
        $this->inputVariables[$variable->getName()] = $variable;
    }
    
    public function addOutputVariable($variable) {
        $this->outputVariables[$variable->getName()] = $variable;
    }
    
    public function addRule($rule) {
        $this->rules[] = $rule;
    }
    
    /**
     * 执行模糊推理
     */
    public function evaluate($inputs) {
        // 1. 模糊化
        $fuzzyInputs = [];
        foreach ($inputs as $varName => $value) {
            if (isset($this->inputVariables[$varName])) {
                $fuzzyInputs[$varName] = $this->inputVariables[$varName]->fuzzify($value);
            }
        }
        
        // 2. 规则评估
        $ruleOutputs = [];
        foreach ($this->rules as $rule) {
            $ruleOutputs[] = $rule->evaluate($fuzzyInputs);
        }
        
        // 3. 聚合规则输出
        $aggregatedOutputs = [];
        foreach ($ruleOutputs as $ruleOutput) {
            $outputVar = key($ruleOutput['consequent']);
            $outputSet = current($ruleOutput['consequent']);
            $truth = $ruleOutput['truth'];
            
            if (!isset($aggregatedOutputs[$outputVar])) {
                $aggregatedOutputs[$outputVar] = [];
            }
            
            $aggregatedOutputs[$outputVar][$outputSet] = 
                isset($aggregatedOutputs[$outputVar][$outputSet]) ? 
                max($aggregatedOutputs[$outputVar][$outputSet], $truth) : $truth;
        }
        
        // 4. 去模糊化
        $crispOutputs = [];
        foreach ($aggregatedOutputs as $varName => $setTruths) {
            if (isset($this->outputVariables[$varName])) {
                $crispOutputs[$varName] = $this->defuzzify(
                    $this->outputVariables[$varName], 
                    $setTruths
                );
            }
        }
        
        return [
            'fuzzy_inputs' => $fuzzyInputs,
            'rule_outputs' => $ruleOutputs,
            'aggregated_outputs' => $aggregatedOutputs,
            'crisp_outputs' => $crispOutputs
        ];
    }
    
    /**
     * 去模糊化 - 重心法
     */
    private function defuzzify($outputVariable, $setTruths) {
        $range = $outputVariable->getRange();
        $min = $range['min'];
        $max = $range['max'];
        
        $numerator = 0;
        $denominator = 0;
        $step = ($max - $min) / 100; // 离散化步长
        
        for ($x = $min; $x <= $max; $x += $step) {
            $membership = 0;
            
            // 计算当前x点的聚合隶属度
            foreach ($setTruths as $setName => $truth) {
                $set = $this->getOutputSet($outputVariable, $setName);
                if ($set) {
                    $membership = max($membership, min($truth, $set->getMembership($x)));
                }
            }
            
            $numerator += $x * $membership;
            $denominator += $membership;
        }
        
        return $denominator > 0 ? $numerator / $denominator : ($min + $max) / 2;
    }
    
    private function getOutputSet($outputVariable, $setName) {
        // 通过反射获取输出变量的模糊集合
        $reflection = new ReflectionClass($outputVariable);
        $property = $reflection->getProperty('sets');
        $property->setAccessible(true);
        $sets = $property->getValue($outputVariable);
        
        return isset($sets[$setName]) ? $sets[$setName] : null;
    }
}

?>
```

### 隶属度函数库

```php
<?php

/**
 * 隶属度函数工厂
 */
class MembershipFunctionFactory {
    
    /**
     * 三角形隶属度函数
     */
    public static function triangular($a, $b, $c) {
        return function($x) use ($a, $b, $c) {
            if ($x <= $a || $x >= $c) {
                return 0;
            } elseif ($x == $b) {
                return 1;
            } elseif ($x < $b) {
                return ($x - $a) / ($b - $a);
            } else {
                return ($c - $x) / ($c - $b);
            }
        };
    }
    
    /**
     * 梯形隶属度函数
     */
    public static function trapezoidal($a, $b, $c, $d) {
        return function($x) use ($a, $b, $c, $d) {
            if ($x <= $a || $x >= $d) {
                return 0;
            } elseif ($x >= $b && $x <= $c) {
                return 1;
            } elseif ($x < $b) {
                return ($x - $a) / ($b - $a);
            } else {
                return ($d - $x) / ($d - $c);
            }
        };
    }
    
    /**
     * 高斯隶属度函数
     */
    public static function gaussian($mean, $sigma) {
        return function($x) use ($mean, $sigma) {
            return exp(-pow($x - $mean, 2) / (2 * pow($sigma, 2)));
        };
    }
    
    /**
     * S型隶属度函数
     */
    public static function sShape($a, $b) {
        return function($x) use ($a, $b) {
            if ($x <= $a) {
                return 0;
            } elseif ($x >= $b) {
                return 1;
            } else {
                return 1 / (1 + exp(-($x - ($a + $b) / 2) / (($b - $a) / 6)));
            }
        };
    }
    
    /**
     * Z型隶属度函数
     */
    public static function zShape($a, $b) {
        return function($x) use ($a, $b) {
            if ($x <= $a) {
                return 1;
            } elseif ($x >= $b) {
                return 0;
            } else {
                return 1 - 1 / (1 + exp(-($x - ($a + $b) / 2) / (($b - $a) / 6)));
            }
        };
    }
}

?>
```

## 应用示例：智能空调控制系统

```php
<?php

/**
 * 智能空调控制系统示例
 */
class SmartAirConditioner {
    private $fuzzySystem;
    
    public function __construct() {
        $this->fuzzySystem = new FuzzyLogicSystem();
        $this->setupSystem();
    }
    
    private function setupSystem() {
        // 创建输入变量：温度
        $temperature = new FuzzyVariable('temperature', 15, 35);
        
        $temperature->addSet(new FuzzySet('cold', 
            MembershipFunctionFactory::trapezoidal(15, 15, 18, 22)));
        $temperature->addSet(new FuzzySet('cool', 
            MembershipFunctionFactory::triangular(18, 22, 25)));
        $temperature->addSet(new FuzzySet('comfortable', 
            MembershipFunctionFactory::triangular(22, 25, 28)));
        $temperature->addSet(new FuzzySet('warm', 
            MembershipFunctionFactory::triangular(25, 28, 30)));
        $temperature->addSet(new FuzzySet('hot', 
            MembershipFunctionFactory::trapezoidal(28, 30, 35, 35)));
        
        // 创建输入变量：湿度
        $humidity = new FuzzyVariable('humidity', 20, 80);
        
        $humidity->addSet(new FuzzySet('dry', 
            MembershipFunctionFactory::trapezoidal(20, 20, 30, 40)));
        $humidity->addSet(new FuzzySet('comfortable', 
            MembershipFunctionFactory::triangular(30, 45, 60)));
        $humidity->addSet(new FuzzySet('humid', 
            MembershipFunctionFactory::trapezoidal(50, 60, 80, 80)));
        
        // 创建输出变量：风速
        $fanSpeed = new FuzzyVariable('fan_speed', 0, 100);
        
        $fanSpeed->addSet(new FuzzySet('low', 
            MembershipFunctionFactory::triangular(0, 0, 50)));
        $fanSpeed->addSet(new FuzzySet('medium', 
            MembershipFunctionFactory::triangular(25, 50, 75)));
        $fanSpeed->addSet(new FuzzySet('high', 
            MembershipFunctionFactory::triangular(50, 100, 100)));
        
        // 创建输出变量：温度设定
        $tempSetting = new FuzzyVariable('temp_setting', 18, 26);
        
        $tempSetting->addSet(new FuzzySet('very_cool', 
            MembershipFunctionFactory::triangular(18, 18, 20)));
        $tempSetting->addSet(new FuzzySet('cool', 
            MembershipFunctionFactory::triangular(19, 20, 22)));
        $tempSetting->addSet(new FuzzySet('comfortable', 
            MembershipFunctionFactory::triangular(21, 22, 23)));
        $tempSetting->addSet(new FuzzySet('warm', 
            MembershipFunctionFactory::triangular(22, 24, 25)));
        $tempSetting->addSet(new FuzzySet('very_warm', 
            MembershipFunctionFactory::triangular(24, 26, 26)));
        
        // 添加变量到系统
        $this->fuzzySystem->addInputVariable($temperature);
        $this->fuzzySystem->addInputVariable($humidity);
        $this->fuzzySystem->addOutputVariable($fanSpeed);
        $this->fuzzySystem->addOutputVariable($tempSetting);
        
        // 定义模糊规则
        $this->setupRules();
    }
    
    private function setupRules() {
        // 规则格式：['输入变量' => '模糊集合', ...] => ['输出变量' => '模糊集合']
        
        $rules = [
            // 温度和湿度对风速的影响
            [['temperature' => 'cold', 'humidity' => 'dry'] => ['fan_speed' => 'low']],
            [['temperature' => 'cold', 'humidity' => 'comfortable'] => ['fan_speed' => 'low']],
            [['temperature' => 'cold', 'humidity' => 'humid'] => ['fan_speed' => 'medium']],
            
            [['temperature' => 'cool', 'humidity' => 'dry'] => ['fan_speed' => 'low']],
            [['temperature' => 'cool', 'humidity' => 'comfortable'] => ['fan_speed' => 'medium']],
            [['temperature' => 'cool', 'humidity' => 'humid'] => ['fan_speed' => 'medium']],
            
            [['temperature' => 'comfortable', 'humidity' => 'dry'] => ['fan_speed' => 'medium']],
            [['temperature' => 'comfortable', 'humidity' => 'comfortable'] => ['fan_speed' => 'medium']],
            [['temperature' => 'comfortable', 'humidity' => 'humid'] => ['fan_speed' => 'high']],
            
            [['temperature' => 'warm', 'humidity' => 'dry'] => ['fan_speed' => 'medium']],
            [['temperature' => 'warm', 'humidity' => 'comfortable'] => ['fan_speed' => 'high']],
            [['temperature' => 'warm', 'humidity' => 'humid'] => ['fan_speed' => 'high']],
            
            [['temperature' => 'hot', 'humidity' => 'dry'] => ['fan_speed' => 'high']],
            [['temperature' => 'hot', 'humidity' => 'comfortable'] => ['fan_speed' => 'high']],
            [['temperature' => 'hot', 'humidity' => 'humid'] => ['fan_speed' => 'high']],
            
            // 温度对设定温度的影响
            [['temperature' => 'cold'] => ['temp_setting' => 'very_warm']],
            [['temperature' => 'cool'] => ['temp_setting' => 'warm']],
            [['temperature' => 'comfortable'] => ['temp_setting' => 'comfortable']],
            [['temperature' => 'warm'] => ['temp_setting' => 'cool']],
            [['temperature' => 'hot'] => ['temp_setting' => 'very_cool']],
        ];
        
        foreach ($rules as $rule) {
            $this->fuzzySystem->addRule(new FuzzyRule(
                key($rule) === 0 ? [] : key($rule), // 前件
                current($rule) // 后件
            ));
        }
    }
    
    /**
     * 根据当前环境条件计算控制参数
     */
    public function calculateControl($temperature, $humidity) {
        $inputs = [
            'temperature' => $temperature,
            'humidity' => $humidity
        ];
        
        return $this->fuzzySystem->evaluate($inputs);
    }
    
    /**
     * 显示控制决策
     */
    public function displayControl($temperature, $humidity) {
        $result = $this->calculateControl($temperature, $humidity);
        
        echo "=== 智能空调控制决策 ===\n";
        echo "当前环境: 温度 {$temperature}°C, 湿度 {$humidity}%\n";
        echo "控制输出:\n";
        echo "- 风速设定: " . round($result['crisp_outputs']['fan_speed']) . "%\n";
        echo "- 温度设定: " . round($result['crisp_outputs']['temp_setting'], 1) . "°C\n";
        
        // 显示模糊化结果
        echo "\n模糊化结果:\n";
        foreach ($result['fuzzy_inputs'] as $varName => $memberships) {
            echo "{$varName}: ";
            foreach ($memberships as $setName => $degree) {
                if ($degree > 0.01) {
                    echo "{$setName}(" . round($degree, 2) . ") ";
                }
            }
            echo "\n";
        }
        
        // 显示激活的规则
        echo "\n激活的规则:\n";
        foreach ($result['rule_outputs'] as $i => $ruleOutput) {
            if ($ruleOutput['truth'] > 0.01) {
                $antecedent = $ruleOutput['consequent'];
                $outputVar = key($antecedent);
                $outputSet = current($antecedent);
                echo "规则{$i}: 如果" . $this->formatConditions($ruleOutput) . 
                     " 那么 {$outputVar} = {$outputSet} (" . 
                     round($ruleOutput['truth'], 2) . ")\n";
            }
        }
        
        echo "\n";
    }
    
    private function formatConditions($ruleOutput) {
        // 简化显示条件
        return "温度合适"; // 实际应该从规则中提取
    }
}

?>
```

## 应用示例与测试

```php
<?php

class FuzzyLogicExamples {
    
    /**
     * 空调控制系统演示
     */
    public static function airConditionerDemo() {
        echo "=== 智能空调控制系统演示 ===\n";
        
        $ac = new SmartAirConditioner();
        
        // 测试不同环境条件
        $testConditions = [
            ['temp' => 17, 'humidity' => 35],  // 冷且干燥
            ['temp' => 20, 'humidity' => 45],  // 凉爽舒适
            ['temp' => 24, 'humidity' => 50],  // 舒适
            ['temp' => 27, 'humidity' => 65],  // 温暖潮湿
            ['temp' => 32, 'humidity' => 75],  // 炎热潮湿
        ];
        
        foreach ($testConditions as $condition) {
            $ac->displayControl($condition['temp'], $condition['humidity']);
        }
    }
    
    /**
     * 汽车巡航控制系统
     */
    public static function cruiseControlDemo() {
        echo "=== 汽车巡航控制系统演示 ===\n";
        
        $fuzzySystem = new FuzzyLogicSystem();
        
        // 输入变量：车速差
        $speedDiff = new FuzzyVariable('speed_difference', -30, 30);
        $speedDiff->addSet(new FuzzySet('slow_down', 
            MembershipFunctionFactory::trapezoidal(-30, -30, -20, -10)));
        $speedDiff->addSet(new FuzzySet('maintain', 
            MembershipFunctionFactory::triangular(-15, 0, 15)));
        $speedDiff->addSet(new FuzzySet('speed_up', 
            MembershipFunctionFactory::trapezoidal(10, 20, 30, 30)));
        
        // 输入变量：距离前车距离
        $distance = new FuzzyVariable('distance', 0, 200);
        $distance->addSet(new FuzzySet('too_close', 
            MembershipFunctionFactory::trapezoidal(0, 0, 20, 50)));
        $distance->addSet(new FuzzySet('safe', 
            MembershipFunctionFactory::triangular(30, 80, 130)));
        $distance->addSet(new FuzzySet('too_far', 
            MembershipFunctionFactory::trapezoidal(100, 150, 200, 200)));
        
        // 输出变量：油门/刹车控制
        $control = new FuzzyVariable('control', -100, 100);
        $control->addSet(new FuzzySet('brake_hard', 
            MembershipFunctionFactory::triangular(-100, -100, -50)));
        $control->addSet(new FuzzySet('brake_light', 
            MembershipFunctionFactory::triangular(-75, -50, -25)));
        $control->addSet(new FuzzySet('maintain', 
            MembershipFunctionFactory::triangular(-25, 0, 25)));
        $control->addSet(new FuzzySet('accelerate_light', 
            MembershipFunctionFactory::triangular(25, 50, 75)));
        $control->addSet(new FuzzySet('accelerate_hard', 
            MembershipFunctionFactory::triangular(50, 100, 100)));
        
        $fuzzySystem->addInputVariable($speedDiff);
        $fuzzySystem->addInputVariable($distance);
        $fuzzySystem->addOutputVariable($control);
        
        // 定义规则
        $rules = [
            [['speed_difference' => 'slow_down', 'distance' => 'too_close'] => ['control' => 'brake_hard']],
            [['speed_difference' => 'slow_down', 'distance' => 'safe'] => ['control' => 'brake_light']],
            [['speed_difference' => 'slow_down', 'distance' => 'too_far'] => ['control' => 'maintain']],
            
            [['speed_difference' => 'maintain', 'distance' => 'too_close'] => ['control' => 'brake_light']],
            [['speed_difference' => 'maintain', 'distance' => 'safe'] => ['control' => 'maintain']],
            [['speed_difference' => 'maintain', 'distance' => 'too_far'] => ['control' => 'accelerate_light']],
            
            [['speed_difference' => 'speed_up', 'distance' => 'too_close'] => ['control' => 'brake_hard']],
            [['speed_difference' => 'speed_up', 'distance' => 'safe'] => ['control' => 'accelerate_light']],
            [['speed_difference' => 'speed_up', 'distance' => 'too_far'] => ['control' => 'accelerate_hard']],
        ];
        
        foreach ($rules as $rule) {
            $fuzzySystem->addRule(new FuzzyRule(key($rule), current($rule)));
        }
        
        // 测试不同驾驶情况
        $testScenarios = [
            ['diff' => -25, 'dist' => 30],  // 车速过快且距离太近
            ['diff' => -10, 'dist' => 80],  // 稍快但安全距离
            ['diff' => 0, 'dist' => 100],   // 保持良好
            ['diff' => 15, 'dist' => 60],   // 稍慢但距离合适
            ['diff' => 25, 'dist' => 180],  // 车速过慢且距离太远
        ];
        
        foreach ($testScenarios as $scenario) {
            $result = $fuzzySystem->evaluate([
                'speed_difference' => $scenario['diff'],
                'distance' => $scenario['dist']
            ]);
            
            $control = $result['crisp_outputs']['control'];
            $action = $control < -50 ? "紧急刹车" : 
                     ($control < -10 ? "轻踩刹车" : 
                     ($control < 10 ? "保持油门" : 
                     ($control < 50 ? "轻踩油门" : "大力加速")));
                     
            echo "速度差: {$scenario['diff']} km/h, 距离: {$scenario['dist']} m => " .
                 "控制值: " . round($control) . " ({$action})\n";
        }
    }
    
    /**
     * 洗衣机模糊控制系统
     */
    public static function washingMachineDemo() {
        echo "\n=== 智能洗衣机控制系统演示 ===\n";
        
        $fuzzySystem = new FuzzyLogicSystem();
        
        // 输入变量：衣物脏污程度
        $dirtiness = new FuzzyVariable('dirtiness', 0, 100);
        $dirtiness->addSet(new FuzzySet('slightly_dirty', 
            MembershipFunctionFactory::trapezoidal(0, 0, 20, 40)));
        $dirtiness->addSet(new FuzzySet('moderately_dirty', 
            MembershipFunctionFactory::triangular(30, 50, 70)));
        $dirtiness->addSet(new FuzzySet('very_dirty', 
            MembershipFunctionFactory::trapezoidal(60, 80, 100, 100)));
        
        // 输入变量：衣物重量
        $load = new FuzzyVariable('load', 0, 10);
        $load->addSet(new FuzzySet('light', 
            MembershipFunctionFactory::trapezoidal(0, 0, 2, 4)));
        $load->addSet(new FuzzySet('medium', 
            MembershipFunctionFactory::triangular(3, 5, 7)));
        $load->addSet(new FuzzySet('heavy', 
            MembershipFunctionFactory::trapezoidal(6, 8, 10, 10)));
        
        // 输出变量：洗涤时间
        $washTime = new FuzzyVariable('wash_time', 10, 60);
        $washTime->addSet(new FuzzySet('short', 
            MembershipFunctionFactory::triangular(10, 10, 30)));
        $washTime->addSet(new FuzzySet('medium', 
            MembershipFunctionFactory::triangular(20, 35, 50)));
        $washTime->addSet(new FuzzySet('long', 
            MembershipFunctionFactory::triangular(40, 60, 60)));
        
        $fuzzySystem->addInputVariable($dirtiness);
        $fuzzySystem->addInputVariable($load);
        $fuzzySystem->addOutputVariable($washTime);
        
        // 定义规则
        $rules = [
            [['dirtiness' => 'slightly_dirty', 'load' => 'light'] => ['wash_time' => 'short']],
            [['dirtiness' => 'slightly_dirty', 'load' => 'medium'] => ['wash_time' => 'short']],
            [['dirtiness' => 'slightly_dirty', 'load' => 'heavy'] => ['wash_time' => 'medium']],
            
            [['dirtiness' => 'moderately_dirty', 'load' => 'light'] => ['wash_time' => 'medium']],
            [['dirtiness' => 'moderately_dirty', 'load' => 'medium'] => ['wash_time' => 'medium']],
            [['dirtiness' => 'moderately_dirty', 'load' => 'heavy'] => ['wash_time' => 'long']],
            
            [['dirtiness' => 'very_dirty', 'load' => 'light'] => ['wash_time' => 'long']],
            [['dirtiness' => 'very_dirty', 'load' => 'medium'] => ['wash_time' => 'long']],
            [['dirtiness' => 'very_dirty', 'load' => 'heavy'] => ['wash_time' => 'long']],
        ];
        
        foreach ($rules as $rule) {
            $fuzzySystem->addRule(new FuzzyRule(key($rule), current($rule)));
        }
        
        // 测试不同洗衣情况
        $testScenarios = [
            ['dirt' => 15, 'weight' => 2],  // 轻微脏，少量衣物
            ['dirt' => 25, 'weight' => 5],  // 中等脏，中等衣物
            ['dirt' => 60, 'weight' => 3],  // 很脏，少量衣物
            ['dirt' => 45, 'weight' => 8],  // 中等脏，大量衣物
            ['dirt' => 85, 'weight' => 7],  // 非常脏，大量衣物
        ];
        
        foreach ($testScenarios as $scenario) {
            $result = $fuzzySystem->evaluate([
                'dirtiness' => $scenario['dirt'],
                'load' => $scenario['weight']
            ]);
            
            $time = $result['crisp_outputs']['wash_time'];
            echo "脏污度: {$scenario['dirt']}%, 重量: {$scenario['weight']}kg => " .
                 "洗涤时间: " . round($time) . "分钟\n";
        }
    }
    
    /**
     * 性能测试
     */
    public static function performanceTest() {
        echo "\n=== 模糊逻辑系统性能测试 ===\n";
        
        $ac = new SmartAirConditioner();
        $startTime = microtime(true);
        
        $testCount = 100;
        for ($i = 0; $i < $testCount; $i++) {
            $temp = 15 + ($i / $testCount) * 20; // 15-35度
            $humidity = 20 + ($i / $testCount) * 60; // 20-80%
            $ac->calculateControl($temp, $humidity);
        }
        
        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000; // 毫秒
        
        echo "执行 {$testCount} 次推理耗时: " . number_format($executionTime, 2) . "ms\n";
        echo "平均每次推理: " . number_format($executionTime / $testCount, 2) . "ms\n";
    }
}

// 运行所有示例
FuzzyLogicExamples::airConditionerDemo();
FuzzyLogicExamples::cruiseControlDemo();
FuzzyLogicExamples::washingMachineDemo();
FuzzyLogicExamples::performanceTest();

?>
```

## 高级特性

### 自适应模糊系统

```php
<?php

/**
 * 自适应模糊逻辑系统
 * 能够根据历史数据调整隶属度函数
 */
class AdaptiveFuzzySystem extends FuzzyLogicSystem {
    private $learningRate;
    private $trainingData;
    
    public function __construct($learningRate = 0.01) {
        parent::__construct();
        $this->learningRate = $learningRate;
        $this->trainingData = [];
    }
    
    /**
     * 添加训练数据
     */
    public function addTrainingData($inputs, $expectedOutputs) {
        $this->trainingData[] = [
            'inputs' => $inputs,
            'expected' => $expectedOutputs
        ];
    }
    
    /**
     * 训练模糊系统
     */
    public function train($epochs = 100) {
        for ($epoch = 0; $epoch < $epochs; $epoch++) {
            $totalError = 0;
            
            foreach ($this->trainingData as $data) {
                $actualOutputs = $this->evaluate($data['inputs'])['crisp_outputs'];
                $error = $this->calculateError($actualOutputs, $data['expected']);
                $totalError += $error;
                
                // 调整隶属度函数参数（简化实现）
                $this->adjustMembershipFunctions($data['inputs'], $error);
            }
            
            if ($epoch % 10 == 0) {
                echo "Epoch {$epoch}, 平均误差: " . ($totalError / count($this->trainingData)) . "\n";
            }
        }
    }
    
    private function calculateError($actual, $expected) {
        $error = 0;
        foreach ($expected as $varName => $value) {
            if (isset($actual[$varName])) {
                $error += abs($actual[$varName] - $value);
            }
        }
        return $error;
    }
    
    private function adjustMembershipFunctions($inputs, $error) {
        // 简化实现：实际应用中需要更复杂的调整策略
        // 这里只是演示概念
        foreach ($inputs as $varName => $value) {
            // 根据误差调整相关隶属度函数的参数
        }
    }
}

?>
```

### 类型2模糊逻辑

```php
<?php

/**
 * 区间类型2模糊集合
 * 处理更高级的不确定性
 */
class IntervalType2FuzzySet {
    private $name;
    private $lowerMembershipFunction;
    private $upperMembershipFunction;
    
    public function __construct($name, $lowerMF, $upperMF) {
        $this->name = $name;
        $this->lowerMembershipFunction = $lowerMF;
        $this->upperMembershipFunction = $upperMF;
    }
    
    /**
     * 获取隶属度区间
     */
    public function getMembershipInterval($x) {
        return [
            'lower' => call_user_func($this->lowerMembershipFunction, $x),
            'upper' => call_user_func($this->upperMembershipFunction, $x)
        ];
    }
}

/**
 * 类型2模糊逻辑系统
 */
class Type2FuzzyLogicSystem extends FuzzyLogicSystem {
    // 类型2模糊逻辑提供了对不确定性的更好处理
    // 实现比类型1更复杂，但原理类似
}

?>
```

## 实际应用场景

### 工业控制
```php
class IndustrialController {
    private $fuzzySystem;
    
    public function controlProcess($temperature, $pressure, $flowRate) {
        $result = $this->fuzzySystem->evaluate([
            'temperature' => $temperature,
            'pressure' => $pressure,
            'flow_rate' => $flowRate
        ]);
        
        return $result['crisp_outputs'];
    }
}
```

### 金融风险评估
```php
class RiskAssessor {
    private $fuzzySystem;
    
    public function assessRisk($income, $debt, $creditScore, $employment) {
        $result = $this->fuzzySystem->evaluate([
            'income' => $income,
            'debt' => $debt,
            'credit_score' => $creditScore,
            'employment_stability' => $employment
        ]);
        
        return $result['crisp_outputs']['risk_level'];
    }
}
```

## 总结

模糊逻辑是处理不确定性和近似推理的强大工具：

### 核心优势
1. **人性化建模**：能够处理"有点"、"比较"等人类自然语言
2. **鲁棒性强**：对噪声和不精确数据有很好的容忍度
3. **易于理解**：基于规则的系统易于理解和维护
4. **计算高效**：相比神经网络等黑盒模型，计算量较小

### 适用场景
- ✅ 控制系统（温度、速度、压力控制）
- ✅ 决策支持系统
- ✅ 模式识别和分类
- ✅ 专家系统
- ✅ 消费电子产品

### 算法复杂度
| 组件 | 时间复杂度 | 空间复杂度 |
|------|------------|------------|
| 模糊化 | O(n×m) | O(m) |
| 规则评估 | O(r) | O(1) |
| 去模糊化 | O(k×p) | O(1) |
| 总体 | O(n×m + r + k×p) | O(m + r) |

### 最佳实践
1. **合理设计隶属度函数**：根据领域知识设计合适的形状和参数
2. **规则数量控制**：避免规则爆炸，保持系统简洁
3. **验证和测试**：使用真实数据验证系统性能
4. **结合其他技术**：可以与神经网络、遗传算法等结合使用

模糊逻辑填补了传统二值逻辑和复杂人工智能之间的空白，让计算机能够更好地理解和处理现实世界中的不确定性，是实现"人性化"智能的重要技术之一。