---
title: rabbitMQ+yii2实现远程过程调用(RPC)
tags:
  - PHP
  - Yii2
  - rabbitMQ
  - RPC
categories: PHP
abbrlink: 'yii2-rabbitmq'
date: 2021-05-27 15:52:24
updated: 2021-05-27 15:52:24
---

### RPC服务端代码
```
<?php

namespace console\controllers;

use yii;
use yii\console\Controller;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class RpcServerController extends Controller{

	private $channel;
	private  $connection;
	
	public function init (){
        $amqp = yii::$app->params['amqp'];
        
        //建立一个到RabbitMQ服务器的连接
        $this->connection = new AMQPStreamConnection($amqp["host"], $amqp["port"], $amqp["user"], $amqp["password"]);
        $this->channel = $this->connection->channel();
	}
	
	/**
	 * RPC服务端
	 */
	public function actionRpcServer(){
        //建立一个到RabbitMQ服务器的连接
        $connection = $this->connection;
        $channel = $this->channel;
        
        //接下来,我们创建一个通道
        $channel->queue_declare('rpc_queue',false,false,false,false);
        function fib($n) {
           return $n;
        }
        
        //回调
        $callback = function($req){
            $n = intval($req->body);
            echo " [.] fib(", $n, ")\n";
            $msg = new AMQPMessage((string) fib($n),[]'correlation_id' => $req->get('correlation_id')]);
            $req->delivery_info['channel']->basic_publish($msg,'', $req->get('reply_to'));
            $req->delivery_info['channel']->basic_ack($req->delivery_info['delivery_tag']);
        };
        
        $channel->basic_qos(null,1,null);
        $channel->basic_consume('rpc_queue','',false,false,false,false,$callback);
        
        while (count($channel->callbacks)) {
			$channel->wait();
        }
        
        $channel->close();
        $connection->close();
	}
}
```

### RPC客户端代码
```
<?php


namespace service\entry;


use common\components\BaseServer;
use common\library\Helper;
use PhpAmqpLib\Channel\AMQPChannel;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use PhpAmqpLib\Wire\AMQPTable;
use Yii;

class RemoteOpenDoor extends BaseServer
{
   const EXPIRE = 5;
   const QUEUE_NAME = "remote_open_door";
   public $devSn,$schoolId;

   /**
    * @var AMQPChannel
    */
   private $channel;
   private $connection,$replyQueue,$corrId,$response,$params;
   private $door = [1,2];

   public function init(){
      $amqp = Yii::$app->params['rabbitMQ'];
      $this->connection = new AMQPStreamConnection($amqp['host'],$amqp['port'],$amqp['user'],$amqp['password'],$amqp['vhost']);
      if(!$this->connection->isConnected()){
         $this->setError(10003,'连接失败');
         return false;
      }
      $this->channel = $this->connection->channel();

      $arguments = new AMQPTable();
      $arguments->set("x-message-ttl",10000);    //消息10s过期
      //$this->channel->queue_declare(self::QUEUE_NAME,false,false,false,false,false,$arguments);
      $this->channel->exchange_declare(self::QUEUE_NAME,'topic',false,false,false);
      //$this->replyQueue = $this->devSn.'_'.$this->schoolId.'_'.microtime(true);
      list($this->replyQueue, ,) = $this->channel->queue_declare("",false,false,false,true,false);
      //回调
      $callback = function(AMQPMessage $rep){
         //var_dump($rep->get_properties());die;
         if($rep->get('correlation_id') == $this->corrId) {
            $this->response = $rep->body;
         }
      };

      //接收回调信息
      $this->channel->basic_consume( $this->replyQueue,'',false,false,false,false,$callback);
   }

   public function __construct(){
      $this->init();
   }

   //组装参数
   protected function buildParams(){
      $params = [
         'expire'=>intval(time() + self::EXPIRE),
         'devSn'=>intval($this->devSn),
         'door'=>$this->door,
      ];

      $this->params = json_encode($params,true);
   }


   //发送mq开门指令
   public function open(){
      $this->buildParams();
      $this->corrId = uniqid();
      $this->response = null;
      $properties = ['correlation_id'=>$this->corrId,'reply_to'=>$this->replyQueue];
      $message = new AMQPMessage($this->params,$properties);
      $this->channel->basic_publish($message,self::QUEUE_NAME,sprintf('school.%d',$this->schoolId));

      //test
      /*$message = new AMQPMessage(json_encode(['FailDoor'=>[1,2]],true),$properties);
      $this->channel->basic_publish($message,'',$this->replyQueue);*/

      try{
         $this->channel->wait(null,false,self::EXPIRE);
      }catch (\Exception $exception){
         $this->setError(10003,'开门失败');
         return false;
      }


      //var_dump($this->response);
      // // $this->channel->close();
      // $this->connection->close();

      $rs = json_decode($this->response,true);
      if (!is_array($rs['failDoor']) && (!$rs['failDoor'] || $rs['failDoor']!=$this->door)){
         return true;
      }

      $this->setError(10003,'开门失败');
      return false;
   }
}
```

### 客户端调用代码：
```
$server = new RemoteOpenDoor();
$server->devSn = $devSn;
$server->schoolId = $teacher->getSchoolId();
$rs = $server->open();
$error = $server->getError();
if(!$rs){
   return $error ? \Yii::$app->responseHelper->error($error)->response() : \Yii::$app->responseHelper->error(new Error(110000,'操作失败！'))->response();
}

return \Yii::$app->responseHelper->success(null)->response();
```

### 参考文档
https://blog.csdn.net/weixin_36851500/article/details/93501861