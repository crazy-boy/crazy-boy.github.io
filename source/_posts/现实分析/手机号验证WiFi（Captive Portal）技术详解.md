---
title: 手机号验证WiFi（Captive Portal）技术详解
tags: [WiFi]
categories: [WiFi]
abbrlink: 'captive-portal-technology-explained'
date: 2025-12-01 17:44:00
updated: 2025-12-01 17:44:00
---


> 需要手机号验证才能连接的WiFi，技术上称为**强制门户(Captive Portal)**，广泛应用于酒店、机场、商场等公共场所，既提供网络服务又能收集用户信息或进行营销。

## 一、整体架构概览

```
┌─────────┐   连接WiFi    ┌─────────┐    重定向     ┌─────────┐
│ 用户设备 ├───────────────► 路由器/ │◄─────────────┤ 认证服务器 │
│         │◄──────────────┤ AP设备  ├─────────────►│         │
└─────────┘   DHCP/DNS    └─────────┘   HTTP交互   └─────────┘
                              │              │
                              │              │ 短信API
                              │              ▼
                              │        ┌─────────┐
                              └────────┤ 防火墙  │  ┌─────────┐
                                网络控制├─────────┤◄─┤ 短信平台 │
                                        │ 数据库  │  └─────────┘
                                        └─────────┘
```

## 二、核心工作原理

### 1. 网络接入控制流程

```php
<?php

/**
 * Captive Portal 强制门户系统
 */
class CaptivePortalSystem {
    private $networkDevice;    // 网络设备控制器
    private $authServer;       // 认证服务器
    private $firewall;         // 防火墙控制器
    private $database;         // 数据库
    private $smsService;       // 短信服务
    
    public function __construct() {
        $this->networkDevice = new NetworkDeviceController();
        $this->authServer = new AuthenticationServer();
        $this->firewall = new FirewallController();
        $this->database = new Database();
        $this->smsService = new SMSService();
    }
    
    /**
     * 用户连接WiFi后的完整处理流程
     */
    public function handleClientConnection($clientMac, $clientIp) {
        echo "新设备连接: MAC={$clientMac}, IP={$clientIp}\n";
        
        // 1. 将用户加入未认证列表（限制网络访问）
        $this->addToUnauthenticatedList($clientMac, $clientIp);
        
        // 2. 设置防火墙规则，只允许访问认证服务器
        $this->firewall->restrictAccess($clientIp, $this->authServer->getIp());
        
        // 3. 配置DNS劫持或HTTP重定向
        $this->setupRedirect($clientIp);
        
        // 4. 等待用户访问任何网站被重定向到认证页面
        echo "设备已被重定向到认证页面\n";
        return true;
    }
    
    /**
     * 处理用户认证请求
     */
    public function handleAuthenticationRequest($phoneNumber, $verificationCode, $clientInfo) {
        // 验证手机号和验证码
        $isValid = $this->verifyPhoneCode($phoneNumber, $verificationCode);
        
        if ($isValid) {
            // 认证成功，解除网络限制
            $this->grantInternetAccess($clientInfo);
            
            // 记录用户信息（根据法规要求可能需要）
            $this->recordUserAccess($phoneNumber, $clientInfo);
            
            return [
                'success' => true,
                'message' => '认证成功，正在为您开启网络访问',
                'redirect_url' => 'http://www.example.com' // 跳转到指定页面
            ];
        }
        
        return [
            'success' => false,
            'message' => '验证码错误或已过期'
        ];
    }
    
    /**
     * 发送短信验证码
     */
    public function sendVerificationCode($phoneNumber) {
        // 生成验证码
        $code = $this->generateVerificationCode();
        
        // 保存到数据库（带过期时间）
        $this->storeVerificationCode($phoneNumber, $code);
        
        // 发送短信
        $smsResult = $this->smsService->sendCode($phoneNumber, $code);
        
        return $smsResult;
    }
}

?>
```

## 三、关键技术实现

### 1. 设备检测与重定向技术

```php
<?php

/**
 * 设备检测与HTTP重定向
 */
class DeviceDetectionAndRedirect {
    private $unauthClients = [];
    
    /**
     * 检测新设备并设置重定向
     */
    public function detectNewDevice($clientMac, $clientIp) {
        // 通过DHCP租约或ARP表检测新设备
        if ($this->isNewClient($clientMac)) {
            $this->setupRedirectForClient($clientIp);
            return true;
        }
        return false;
    }
    
    /**
     * 设置HTTP重定向（多种技术）
     */
    private function setupRedirectForClient($clientIp) {
        // 方法1: DNS劫持（简单但不够可靠）
        $this->setupDNSHijacking($clientIp);
        
        // 方法2: HTTP透明代理（推荐）
        $this->setupHTTPProxy($clientIp);
        
        // 方法3: 802.1X/WPA2-Enterprise扩展（企业级）
        $this->setup8021xRedirect($clientIp);
    }
    
    /**
     * DNS劫持实现
     */
    private function setupDNSHijacking($clientIp) {
        // 修改DNS服务器响应，将所有域名解析到认证服务器IP
        // 使用dnsmasq配置示例：
        // address=/#/192.168.1.100  # 将所有域名解析到认证服务器
        
        echo "为客户端 {$clientIp} 设置DNS劫持\n";
    }
    
    /**
     * HTTP透明代理实现
     */
    private function setupHTTPProxy($clientIp) {
        // 使用iptables将HTTP流量重定向到透明代理
        // iptables -t nat -A PREROUTING -s $clientIp -p tcp --dport 80 -j REDIRECT --to-port 8080
        
        // 透明代理服务器代码
        $this->startTransparentProxy($clientIp);
    }
    
    /**
     * 透明代理服务器
     */
    private function startTransparentProxy($clientIp) {
        // 监听8080端口，拦截HTTP请求
        $proxy = new TransparentProxy();
        $proxy->onRequest(function($request) use ($clientIp) {
            // 检查是否已经认证
            if (!$this->isClientAuthenticated($clientIp)) {
                // 重定向到认证页面
                $authUrl = $this->getAuthPageUrl($clientIp);
                
                return new HTTPResponse(302, [
                    'Location' => $authUrl,
                    'Cache-Control' => 'no-cache'
                ]);
            }
            
            // 已认证，正常转发请求
            return $this->forwardRequest($request);
        });
    }
    
    /**
     * 生成带客户端信息的认证页面URL
     */
    private function getAuthPageUrl($clientIp) {
        $clientInfo = $this->getClientInfo($clientIp);
        
        $params = http_build_query([
            'client_ip' => $clientIp,
            'client_mac' => $clientInfo['mac'],
            'ap_mac' => $clientInfo['ap_mac'],
            'ssid' => urlencode($clientInfo['ssid']),
            'redirect_url' => urlencode($_GET['redirect'] ?? 'http://www.example.com')
        ]);
        
        return "http://auth.example.com/portal?{$params}";
    }
}

/**
 * 透明代理类
 */
class TransparentProxy {
    private $port = 8080;
    private $requestHandler;
    
    public function __construct() {
        // 初始化代理服务器
    }
    
    public function onRequest(callable $handler) {
        $this->requestHandler = $handler;
    }
    
    public function start() {
        echo "透明代理启动在端口 {$this->port}\n";
        
        // 实际实现会监听端口并处理请求
        while (true) {
            // 接收HTTP请求
            $request = $this->receiveHTTPRequest();
            
            // 调用处理函数
            $response = call_user_func($this->requestHandler, $request);
            
            // 发送响应
            $this->sendHTTPResponse($response);
        }
    }
}

?>
```

### 2. 认证服务器实现

```php
<?php

/**
 * 完整的认证服务器
 */
class AuthenticationServer {
    private $db;
    private $sessionManager;
    private $rateLimiter;
    
    public function __construct() {
        $this->db = new PDO('mysql:host=localhost;dbname=captive_portal', 'username', 'password');
        $this->sessionManager = new SessionManager();
        $this->rateLimiter = new RateLimiter();
    }
    
    /**
     * 处理认证页面请求
     */
    public function handlePortalRequest($request) {
        $clientInfo = $request->getClientInfo();
        
        // 检查是否已认证
        if ($this->isAlreadyAuthenticated($clientInfo['mac'])) {
            return $this->redirectToInternet();
        }
        
        // 显示认证页面
        return $this->renderAuthPage($clientInfo);
    }
    
    /**
     * 渲染认证页面（HTML响应）
     */
    private function renderAuthPage($clientInfo) {
        $html = <<<HTML
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WiFi认证 - {$clientInfo['ssid']}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
        .container { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
        input, button { width: 100%; padding: 10px; margin: 10px 0; }
        .countdown { color: #666; font-size: 12px; }
        .agreement { font-size: 12px; color: #666; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h2>欢迎使用 {$clientInfo['ssid']} WiFi</h2>
        <p>请输入手机号获取验证码进行认证</p>
        
        <div id="step1">
            <input type="tel" id="phone" placeholder="请输入手机号码" maxlength="11">
            <button onclick="sendCode()" id="sendBtn">获取验证码</button>
            <div class="countdown" id="countdown" style="display:none;"></div>
            
            <div class="agreement">
                <input type="checkbox" id="agree" checked>
                我已阅读并同意 <a href="/terms" target="_blank">《服务协议》</a> 和 
                <a href="/privacy" target="_blank">《隐私政策》</a>
            </div>
        </div>
        
        <div id="step2" style="display:none;">
            <input type="text" id="code" placeholder="请输入6位验证码" maxlength="6">
            <button onclick="verifyCode()">连接网络</button>
        </div>
        
        <input type="hidden" id="client_mac" value="{$clientInfo['mac']}">
        <input type="hidden" id="client_ip" value="{$clientInfo['ip']}">
        
        <div id="message" style="color:red; margin-top:10px;"></div>
    </div>
    
    <script>
        let countdownTime = 60;
        let countdownInterval;
        
        function sendCode() {
            const phone = document.getElementById('phone').value;
            const agree = document.getElementById('agree').checked;
            
            if (!/^1[3-9]\d{9}$/.test(phone)) {
                showMessage('请输入有效的手机号码');
                return;
            }
            
            if (!agree) {
                showMessage('请同意服务协议和隐私政策');
                return;
            }
            
            // 发送验证码请求
            fetch('/api/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: phone,
                    client_mac: document.getElementById('client_mac').value,
                    client_ip: document.getElementById('client_ip').value
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('验证码已发送');
                    document.getElementById('step1').style.display = 'none';
                    document.getElementById('step2').style.display = 'block';
                    startCountdown();
                } else {
                    showMessage(data.message || '发送失败');
                }
            });
        }
        
        function verifyCode() {
            const phone = document.getElementById('phone').value;
            const code = document.getElementById('code').value;
            
            fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: phone,
                    code: code,
                    client_mac: document.getElementById('client_mac').value,
                    client_ip: document.getElementById('client_ip').value
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage('认证成功，正在连接网络...', 'green');
                    setTimeout(() => {
                        window.location.href = data.redirect_url || 'http://www.example.com';
                    }, 2000);
                } else {
                    showMessage(data.message || '验证失败');
                }
            });
        }
        
        function startCountdown() {
            const btn = document.getElementById('sendBtn');
            const countdownEl = document.getElementById('countdown');
            
            btn.disabled = true;
            countdownEl.style.display = 'block';
            
            countdownInterval = setInterval(() => {
                countdownTime--;
                countdownEl.textContent = `${countdownTime}秒后可重新发送`;
                
                if (countdownTime <= 0) {
                    clearInterval(countdownInterval);
                    btn.disabled = false;
                    countdownEl.style.display = 'none';
                    countdownTime = 60;
                }
            }, 1000);
        }
        
        function showMessage(msg, color = 'red') {
            const el = document.getElementById('message');
            el.textContent = msg;
            el.style.color = color;
        }
    </script>
</body>
</html>
HTML;

        return new HTTPResponse(200, [], $html);
    }
    
    /**
     * 发送验证码API
     */
    public function handleSendCodeRequest($request) {
        $data = $request->getJsonData();
        $phone = $data['phone'];
        $clientMac = $data['client_mac'];
        
        // 频率限制
        if (!$this->rateLimiter->checkLimit($phone, 'send_code', 3, 300)) { // 5分钟内最多3次
            return ['success' => false, 'message' => '发送过于频繁，请稍后再试'];
        }
        
        // 生成验证码
        $code = $this->generateVerificationCode();
        
        // 保存到数据库
        $stmt = $this->db->prepare("
            INSERT INTO verification_codes 
            (phone, code, client_mac, created_at, expires_at) 
            VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))
        ");
        $stmt->execute([$phone, $code, $clientMac]);
        
        // 发送短信
        $smsResult = $this->sendSMSCode($phone, $code);
        
        if ($smsResult) {
            return ['success' => true, 'message' => '验证码已发送'];
        }
        
        return ['success' => false, 'message' => '短信发送失败'];
    }
    
    /**
     * 验证验证码API
     */
    public function handleVerifyRequest($request) {
        $data = $request->getJsonData();
        $phone = $data['phone'];
        $code = $data['code'];
        $clientMac = $data['client_mac'];
        $clientIp = $data['client_ip'];
        
        // 查询验证码
        $stmt = $this->db->prepare("
            SELECT id FROM verification_codes 
            WHERE phone = ? AND code = ? AND client_mac = ? 
            AND used = 0 AND expires_at > NOW()
            ORDER BY created_at DESC LIMIT 1
        ");
        $stmt->execute([$phone, $code, $clientMac]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            return ['success' => false, 'message' => '验证码错误或已过期'];
        }
        
        // 标记为已使用
        $this->db->prepare("UPDATE verification_codes SET used = 1 WHERE id = ?")
                 ->execute([$result['id']]);
        
        // 创建认证会话
        $sessionId = $this->sessionManager->createSession([
            'phone' => $phone,
            'client_mac' => $clientMac,
            'client_ip' => $clientIp,
            'authenticated_at' => date('Y-m-d H:i:s')
        ]);
        
        // 通知网络设备解除限制
        $this->notifyNetworkDevice($clientMac, 'grant_access');
        
        // 记录访问日志（根据网络安全法要求）
        $this->logUserAccess($phone, $clientMac, $clientIp);
        
        return [
            'success' => true,
            'message' => '认证成功',
            'redirect_url' => $this->getRedirectUrl($request),
            'session_id' => $sessionId
        ];
    }
    
    /**
     * 通知网络设备（通过API或数据库）
     */
    private function notifyNetworkDevice($clientMac, $action) {
        // 方法1: 直接API调用
        $networkApi = new NetworkDeviceAPI();
        $networkApi->updateClientStatus($clientMac, $action);
        
        // 方法2: 通过数据库状态更新（网络设备轮询）
        $this->db->prepare("
            INSERT INTO client_auth_status 
            (client_mac, action, processed, created_at) 
            VALUES (?, ?, 0, NOW())
        ")->execute([$clientMac, $action]);
    }
}

?>
```

### 3. 短信服务集成

```php
<?php

/**
 * 短信服务抽象层
 */
class SMSService {
    private $provider;
    private $config;
    
    public function __construct($provider = 'aliyun') {
        $this->provider = $provider;
        $this->config = $this->loadConfig($provider);
    }
    
    /**
     * 发送验证码短信
     */
    public function sendCode($phoneNumber, $code) {
        switch ($this->provider) {
            case 'aliyun':
                return $this->sendViaAliyun($phoneNumber, $code);
            case 'tencent':
                return $this->sendViaTencent($phoneNumber, $code);
            case 'yunpian':
                return $this->sendViaYunpian($phoneNumber, $code);
            default:
                return $this->sendViaMock($phoneNumber, $code); // 测试用
        }
    }
    
    /**
     * 阿里云短信服务
     */
    private function sendViaAliyun($phoneNumber, $code) {
        $params = [
            'PhoneNumbers' => $phoneNumber,
            'SignName' => $this->config['sign_name'],
            'TemplateCode' => $this->config['template_code'],
            'TemplateParam' => json_encode(['code' => $code], JSON_UNESCAPED_UNICODE)
        ];
        
        // 构造签名字符串
        ksort($params);
        $sortedString = '';
        foreach ($params as $k => $v) {
            $sortedString .= "&" . $this->encode($k) . "=" . $this->encode($v);
        }
        
        $signature = $this->sign($sortedString);
        
        // 发送请求
        $result = $this->httpRequest('https://dysmsapi.aliyuncs.com', $params, $signature);
        
        return $result['Code'] === 'OK';
    }
    
    /**
     * 腾讯云短信服务
     */
    private function sendViaTencent($phoneNumber, $code) {
        // 腾讯云SDK调用
        $client = new Qcloud\Sms\SmsClient(
            $this->config['app_id'],
            $this->config['app_key']
        );
        
        $ssender = $client->SmsSingleSender();
        $result = $ssender->sendWithParam(
            "86", 
            $phoneNumber,
            $this->config['template_id'],
            [$code, "10"], // 验证码和有效期（分钟）
            $this->config['sign'],
            "",  // 扩展码
            ""   // 国家码
        );
        
        $rsp = json_decode($result, true);
        return $rsp['result'] === 0;
    }
    
    /**
     * 云片短信服务
     */
    private function sendViaYunpian($phoneNumber, $code) {
        $apikey = $this->config['apikey'];
        $text = "【{$this->config['sign']}】您的验证码是{$code}。如非本人操作，请忽略本短信";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://sms.yunpian.com/v2/sms/single_send.json');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'apikey' => $apikey,
            'mobile' => $phoneNumber,
            'text' => $text
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $result = curl_exec($ch);
        curl_close($ch);
        
        $result = json_decode($result, true);
        return $result['code'] === 0;
    }
    
    /**
     * 模拟发送（用于开发和测试）
     */
    private function sendViaMock($phoneNumber, $code) {
        // 开发环境：记录到日志或数据库，不实际发送
        error_log("短信验证码: 发送到 {$phoneNumber}, 验证码: {$code}");
        
        // 或者存储到开发用的临时文件
        file_put_contents('/tmp/sms_codes.log', 
            date('Y-m-d H:i:s') . " {$phoneNumber}: {$code}\n", 
            FILE_APPEND
        );
        
        return true;
    }
}

?>
```

### 4. 防火墙与网络控制

```php
<?php

/**
 * 防火墙控制器（基于iptables）
 */
class FirewallController {
    private $iptablesPath = '/sbin/iptables';
    
    /**
     * 限制客户端只能访问认证服务器
     */
    public function restrictAccess($clientIp, $authServerIp) {
        // 清除现有规则
        $this->exec("{$this->iptablesPath} -t nat -D PREROUTING -s {$clientIp} -j ACCEPT 2>/dev/null");
        
        // 允许访问认证服务器
        $this->exec("{$this->iptablesPath} -t nat -A PREROUTING -s {$clientIp} -d {$authServerIp} -j ACCEPT");
        
        // 重定向HTTP流量到透明代理
        $proxyPort = 8080;
        $this->exec("{$this->iptablesPath} -t nat -A PREROUTING -s {$clientIp} -p tcp --dport 80 -j REDIRECT --to-port {$proxyPort}");
        
        // 重定向DNS查询（可选）
        $this->exec("{$this->iptablesPath} -t nat -A PREROUTING -s {$clientIp} -p udp --dport 53 -j DNAT --to-destination {$authServerIp}:53");
        
        echo "已限制客户端 {$clientIp} 的网络访问\n";
    }
    
    /**
     * 授予客户端完全互联网访问权限
     */
    public function grantFullAccess($clientIp) {
        // 移除重定向规则
        $this->exec("{$this->iptablesPath} -t nat -D PREROUTING -s {$clientIp} -p tcp --dport 80 -j REDIRECT 2>/dev/null");
        $this->exec("{$this->iptablesPath} -t nat -D PREROUTING -s {$clientIp} -p udp --dport 53 -j DNAT 2>/dev/null");
        
        // 允许所有出站流量
        $this->exec("{$this->iptablesPath} -t nat -A PREROUTING -s {$clientIp} -j ACCEPT");
        
        echo "已授予客户端 {$clientIp} 完全网络访问权限\n";
    }
    
    /**
     * 设置会话超时（例如2小时后自动断开）
     */
    public function setSessionTimeout($clientIp, $timeoutHours = 2) {
        $timeoutSeconds = $timeoutHours * 3600;
        
        // 使用iptables的time模块
        $this->exec("{$this->iptablesPath} -A FORWARD -s {$clientIp} -m time --timestart 00:00 --timestop 23:59 --datestop 1970-01-01 -j DROP");
        
        // 或者使用cron job定时清理
        $this->scheduleCleanup($clientIp, $timeoutSeconds);
    }
    
    private function exec($command) {
        system($command, $returnCode);
        return $returnCode === 0;
    }
    
    private function scheduleCleanup($clientIp, $timeoutSeconds) {
        $cronTime = date('i H d m *', time() + $timeoutSeconds);
        $cronCmd = "/usr/local/bin/remove_client.sh {$clientIp}";
        
        // 添加到crontab
        $cronLine = "{$cronTime} {$cronCmd}";
        file_put_contents('/tmp/crontab.txt', "{$cronLine}\n", FILE_APPEND);
        
        exec('crontab /tmp/crontab.txt');
    }
}

/**
 * 基于OpenWrt的实现
 */
class OpenWrtController extends FirewallController {
    private $uciPath = '/sbin/uci';
    
    /**
     * 使用OpenWrt的uci配置防火墙
     */
    public function configureOpenWrtFirewall($clientMac, $action) {
        $zone = 'wan'; // 或者根据网络配置
        
        if ($action === 'restrict') {
            // 创建流量规则
            $ruleId = uniqid('rule_');
            
            $this->exec("{$this->uciPath} set firewall.{$ruleId}=rule");
            $this->exec("{$this->uciPath} set firewall.{$ruleId}.name='captive-{$clientMac}'");
            $this->exec("{$this->uciPath} set firewall.{$ruleId}.src_mac='{$clientMac}'");
            $this->exec("{$this->uciPath} set firewall.{$ruleId}.proto='tcp'");
            $this->exec("{$this->uciPath} set firewall.{$ruleId}.dest_port='80 443'");
            $this->exec("{$this->uciPath} set firewall.{$ruleId}.target='REJECT'");
            $this->exec("{$this->uciPath} commit firewall");
            $this->exec('/etc/init.d/firewall reload');
        } elseif ($action === 'allow') {
            // 删除限制规则
            $this->exec("{$this->uciPath} delete firewall.@rule[0] 2>/dev/null");
            $this->exec("{$this->uciPath} commit firewall");
            $this->exec('/etc/init.d/firewall reload');
        }
    }
}

?>
```

### 5. 数据库设计

```sql
-- 验证码表
CREATE TABLE verification_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(11) NOT NULL,
    code VARCHAR(6) NOT NULL,
    client_mac VARCHAR(17) NOT NULL,
    client_ip VARCHAR(15),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    used_at DATETIME,
    INDEX idx_phone (phone),
    INDEX idx_expires (expires_at),
    INDEX idx_client_mac (client_mac)
);

-- 认证会话表
CREATE TABLE auth_sessions (
    id VARCHAR(32) PRIMARY KEY,
    phone VARCHAR(11) NOT NULL,
    client_mac VARCHAR(17) NOT NULL,
    client_ip VARCHAR(15) NOT NULL,
    ap_mac VARCHAR(17),
    ssid VARCHAR(64),
    authenticated_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    data TEXT, -- JSON格式的额外数据
    INDEX idx_client_mac (client_mac),
    INDEX idx_expires (expires_at)
);

-- 用户访问日志表（根据网络安全法要求）
CREATE TABLE access_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(11) NOT NULL,
    client_mac VARCHAR(17) NOT NULL,
    client_ip VARCHAR(15) NOT NULL,
    ap_mac VARCHAR(17),
    ssid VARCHAR(64),
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    upload_bytes BIGINT DEFAULT 0,
    download_bytes BIGINT DEFAULT 0,
    INDEX idx_phone_time (phone, start_time),
    INDEX idx_mac_time (client_mac, start_time)
);

-- 网络设备状态表（用于网络设备轮询）
CREATE TABLE client_auth_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_mac VARCHAR(17) NOT NULL,
    action ENUM('allow', 'deny', 'restrict') NOT NULL,
    processed TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    INDEX idx_unprocessed (processed, created_at),
    INDEX idx_mac (client_mac)
);
```

## 四、安全与合规考虑

### 1. 数据隐私保护

```php
<?php

/**
 * 数据隐私保护模块
 */
class DataPrivacyProtection {
    
    /**
     * 手机号脱敏处理
     */
    public static function maskPhoneNumber($phone) {
        return substr($phone, 0, 3) . '****' . substr($phone, 7);
    }
    
    /**
     * 数据加密存储
     */
    public function encryptSensitiveData($data) {
        $key = $this->getEncryptionKey();
        $iv = openssl_random_pseudo_bytes(16);
        
        $encrypted = openssl_encrypt(
            json_encode($data),
            'AES-256-CBC',
            $key,
            OPENSSL_RAW_DATA,
            $iv
        );
        
        return base64_encode($iv . $encrypted);
    }
    
    /**
     * 合规的数据保留策略
     */
    public function applyDataRetentionPolicy() {
        // 根据《网络安全法》要求，日志保存不少于6个月
        $sixMonthsAgo = date('Y-m-d H:i:s', strtotime('-6 months'));
        
        // 删除过期的验证码记录（保留7天）
        $this->db->exec("
            DELETE FROM verification_codes 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
        ");
        
        // 删除过期的会话记录
        $this->db->exec("
            DELETE FROM auth_sessions 
            WHERE expires_at < NOW()
        ");
        
        // 定期归档访问日志（超过6个月的移动到归档表）
        $this->archiveOldLogs($sixMonthsAgo);
    }
    
    /**
     * 获取用户同意（GDPR/个人信息保护法）
     */
    public function getUserConsent($phone) {
        // 显示用户协议和隐私政策
        // 记录用户同意的时间和版本
        $consentRecord = [
            'phone' => $phone,
            'agreement_version' => '1.2',
            'privacy_version' => '2.1',
            'consent_time' => date('Y-m-d H:i:s'),
            'ip_address' => $_SERVER['REMOTE_ADDR']
        ];
        
        $this->db->insert('user_consents', $consentRecord);
    }
}

?>
```

### 2. 防止滥用机制

```php
<?php

/**
 * 防滥用和安全保护
 */
class AbusePrevention {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * 频率限制
     */
    public function rateLimit($key, $action, $limit, $windowSeconds) {
        $windowStart = time() - $windowSeconds;
        
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count FROM rate_limits 
            WHERE `key` = ? AND action = ? AND timestamp > ?
        ");
        $stmt->execute([$key, $action, $windowStart]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['count'] >= $limit) {
            return false;
        }
        
        // 记录本次请求
        $this->db->prepare("
            INSERT INTO rate_limits (`key`, action, timestamp) 
            VALUES (?, ?, ?)
        ")->execute([$key, $action, time()]);
        
        return true;
    }
    
    /**
     * 黑名单检查
     */
    public function checkBlacklist($phone, $clientMac, $clientIp) {
        // 检查手机号黑名单
        $stmt = $this->db->prepare("
            SELECT 1 FROM blacklist_phones WHERE phone = ? LIMIT 1
        ");
        $stmt->execute([$phone]);
        if ($stmt->fetch()) {
            return 'phone_blacklisted';
        }
        
        // 检查MAC地址黑名单
        $stmt = $this->db->prepare("
            SELECT 1 FROM blacklist_macs WHERE mac = ? LIMIT 1
        ");
        $stmt->execute([$clientMac]);
        if ($stmt->fetch()) {
            return 'mac_blacklisted';
        }
        
        // 检查IP地址黑名单
        $stmt = $this->db->prepare("
            SELECT 1 FROM blacklist_ips WHERE ip = ? LIMIT 1
        ");
        $stmt->execute([$clientIp]);
        if ($stmt->fetch()) {
            return 'ip_blacklisted';
        }
        
        return false;
    }
    
    /**
     * 验证码安全增强
     */
    public function enhanceCodeSecurity($phone, $code) {
        // 避免使用简单数字组合
        if ($this->isWeakCode($code)) {
            return false;
        }
        
        // 防止重放攻击
        $stmt = $this->db->prepare("
            SELECT 1 FROM verification_codes 
            WHERE phone = ? AND code = ? AND used = 0 AND expires_at > NOW()
        ");
        $stmt->execute([$phone, $code]);
        
        return $stmt->fetch() !== false;
    }
    
    private function isWeakCode($code) {
        $weakPatterns = [
            '/^(\d)\1{5}$/',           // 111111
            '/^123456$/',               // 123456
            '/^654321$/',               // 654321
            '/^\d{6}$/'                 // 任何6位数字（可根据需要调整）
        ];
        
        foreach ($weakPatterns as $pattern) {
            if (preg_match($pattern, $code)) {
                return true;
            }
        }
        
        return false;
    }
}

?>
```

## 五、部署与配置

### 1. 路由器/AP配置示例

```bash
# 基于OpenWrt的配置示例

# 安装必要软件包
opkg update
opkg install dnsmasq-full iptables-mod-nat-extra wpad hostapd

# 配置DNSMASQ（DNS劫持）
cat >> /etc/dnsmasq.conf <<EOF
# 将所有域名解析到认证服务器
address=/#/192.168.1.100

# DHCP配置
dhcp-range=192.168.1.100,192.168.1.200,12h
dhcp-option=3,192.168.1.1
dhcp-option=6,192.168.1.100
EOF

# 配置防火墙规则
cat >> /etc/firewall.user <<EOF
# 重定向HTTP到透明代理
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080

# 允许访问认证服务器
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
EOF

# 重启服务
/etc/init.d/dnsmasq restart
/etc/init.d/firewall restart
```

### 2. Docker部署认证服务器

```dockerfile
# Dockerfile
FROM php:8.1-apache

# 安装必要扩展
RUN apt-get update && apt-get install -y \
    libpng-dev libzip-dev libicu-dev libpq-dev \
    && docker-php-ext-install pdo pdo_mysql gd zip intl

# 配置Apache
RUN a2enmod rewrite headers

# 复制应用代码
COPY . /var/www/html/

# 设置权限
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage

# 环境变量
ENV DB_HOST=db \
    DB_DATABASE=captive_portal \
    DB_USERNAME=portal_user \
    DB_PASSWORD=secure_password \
    REDIS_HOST=redis \
    SMS_PROVIDER=aliyun

EXPOSE 80

CMD ["apache2-foreground"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
      - "443:443"
    environment:
      - DB_HOST=db
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/var/www/html/storage/logs
      - ./uploads:/var/www/html/storage/uploads

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: captive_portal
      MYSQL_USER: portal_user
      MYSQL_PASSWORD: secure_password
    volumes:
      - db_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:alpine

  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - web

volumes:
  db_data:
```

## 六、实际应用场景

### 1. 商场WiFi营销系统

```php
<?php

/**
 * 商场WiFi营销系统
 */
class MallWiFiMarketing {
    private $portalSystem;
    private $customerDatabase;
    private $marketingEngine;
    
    public function __construct() {
        $this->portalSystem = new CaptivePortalSystem();
        $this->customerDatabase = new CustomerDatabase();
        $this->marketingEngine = new MarketingEngine();
    }
    
    /**
     * 处理用户认证并关联营销活动
     */
    public function handleCustomerAuthentication($phone, $clientInfo) {
        // 1. 验证手机号
        $code = $this->portalSystem->sendVerificationCode($phone);
        
        // 2. 等待用户输入验证码...
        // 3. 验证成功后...
        
        // 4. 检查是否为老客户
        $customer = $this->customerDatabase->findCustomerByPhone($phone);
        
        if ($customer) {
            // 老客户：更新访问记录
            $this->updateCustomerVisit($customer, $clientInfo);
            
            // 推送个性化优惠
            $coupon = $this->marketingEngine->generatePersonalizedCoupon($customer);
            $this->sendWelcomeBackMessage($phone, $coupon);
        } else {
            // 新客户：创建客户档案
            $newCustomer = $this->createNewCustomer($phone, $clientInfo);
            
            // 发送新客户优惠
            $welcomeGift = $this->marketingEngine->generateWelcomeGift();
            $this->sendWelcomeMessage($phone, $welcomeGift);
            
            // 引导关注公众号
            $this->promoteWechatOfficialAccount($phone);
        }
        
        // 5. 记录营销数据
        $this->recordMarketingData($phone, $clientInfo);
        
        // 6. 授予网络访问权限
        $this->portalSystem->grantInternetAccess($clientInfo);
    }
    
    /**
     * 收集用户画像数据
     */
    public function collectUserProfile($clientInfo) {
        $profile = [
            'device_type' => $this->detectDeviceType($clientInfo['user_agent']),
            'connection_time' => date('Y-m-d H:i:s'),
            'location' => $this->estimateLocation($clientInfo['ap_mac']),
            'visit_frequency' => $this->calculateVisitFrequency($clientInfo['client_mac']),
            'duration' => $this->trackSessionDuration($clientInfo['client_mac'])
        ];
        
        return $profile;
    }
}

?>
```

### 2. 酒店WiFi管理系统

```php
<?php

/**
 * 酒店WiFi管理系统
 */
class HotelWiFiSystem extends CaptivePortalSystem {
    private $roomDatabase;
    private $guestManagement;
    
    /**
     * 与酒店管理系统集成
     */
    public function integrateWithPMS($roomNumber, $guestInfo) {
        // 从PMS获取客人信息
        $guest = $this->roomDatabase->getGuestByRoom($roomNumber);
        
        if ($guest) {
            // 自动发送WiFi密码到客人手机
            $wifiPassword = $this->generateWiFiPassword($roomNumber);
            $this->sendWiFiCredentials($guest['phone'], $wifiPassword);
            
            // 设置房间号与MAC地址绑定
            $this->bindRoomToDevice($roomNumber, $guestInfo['client_mac']);
            
            // 设置退房时间自动断开
            $checkoutTime = $guest['checkout_time'];
            $this->scheduleDisconnection($guestInfo['client_mac'], $checkoutTime);
        }
    }
    
    /**
     * 访客WiFi（限时免费）
     */
    public function handleVisitorWiFi($visitorPhone) {
        // 发送临时访问码（2小时有效）
        $tempCode = $this->generateTemporaryAccess($visitorPhone, 2);
        
        // 限制带宽和访问权限
        $this->applyVisitorLimitations($visitorPhone);
        
        return $tempCode;
    }
}

?>
```

## 七、总结与最佳实践

### 关键技术要点

1. **重定向技术选择**：
    - HTTP重定向：兼容性好，实现简单
    - DNS劫持：对用户透明，但HTTPS有限制
    - 透明代理：功能强大，需要更多配置

2. **认证流程设计**：
    - 清晰的用户界面和指引
    - 多语言支持（国际化场景）
    - 无障碍访问考虑

3. **短信服务集成**：
    - 多服务商冗余，提高可靠性
    - 失败重试和降级策略
    - 成本优化（按量选择服务商）

### 合规与安全建议

1. **法律法规遵守**：
    - 在中国遵守《网络安全法》
    - 在欧盟遵守GDPR
    - 明确用户协议和隐私政策

2. **数据安全**：
    - 敏感信息加密存储
    - 定期安全审计
    - 访问控制和日志记录

3. **防滥用措施**：
    - 频率限制和黑名单
    - 验证码复杂度要求
    - 异常行为检测

### 性能优化

1. **数据库优化**：
    - 合理索引设计
    - 查询缓存
    - 读写分离（大流量场景）

2. **缓存策略**：
    - Redis缓存认证状态
    - CDN静态资源加速
    - 浏览器缓存利用

3. **高可用架构**：
    - 负载均衡
    - 数据库主从复制
    - 故障自动转移

手机号验证WiFi系统是一个涉及网络技术、Web开发、短信服务和数据安全的综合性项目。正确实施可以为用户提供便捷的网络访问，为运营方提供用户数据和营销机会，但同时也需要承担相应的安全和合规责任。