/**
 * Created by Administrator on 2017/3/12.
 */
const mq = require('amqplib');
const util = require('util');
const EventEmitter = require('events').EventEmitter;
const debug = require('debug')('rmq');

/**
 * rmq消息实例
 * @param type 0（生产者）/1（消费者）
 * @param exchange
 * @param mode
 * @returns {rmq}
 */
function rmq(type = 1, exchange = 'server', mode = 'direct') {
    if (!(this instanceof rmq)) {
        return new rmq();
    }

    /**
     * 初始化
     */
    EventEmitter.call(this);

    // 配置参数
    let config = {
        // 类型
        type: type,
        // 消息订阅
        describe: new Set()
    };

    // 生产者模式
    if (type == 0) {
        // exchange name
        config.exchange = exchange;
        // 数据分发模式
        config.mode = mode;
        // 路由关键字
        config.routekey = new Map();
    };

    // 基础配置
    this.config = config;
    // 连接标志
    this.flag = false;
    // 通道
    this.channel = null;
    // 定时器ID
    this.timer = null;
    // 客户端实例
    this.client = null;

    /**
     * 重连mq服务器
     */
    const recon = async (time = 10000) => {
        if (this.timer) {
            return;
        }

        // 创建定时器
        this.timer = setInterval(async () => {
            try {
                await this.connect(this.url);
                // 连接失败，等待下次重连
                if (!this.flag) {
                    return;
                }

                // 连接成功，停止定时器
                clearInterval(this.timer);
                this.timer = null;

                // 绑定路由关键字
                if (type == 0) {
                    for (let [queue, route] of this.config.routekey) {
                        this.routeKey(queue, route);
                    }
                }

                // 消息订阅
                for (let item of this.config.describe) {
                    this.consume(item);
                }
            } catch (e) {
                debug('exception: ', e);
            }

        }, time);
    }

    /**
     * 连接mq服务器
     * @param {String} 服务器连接地址
     */
    rmq.prototype.connect = async (url) => {
        this.url = url;
        this.client = await mq.connect(this.url);
        this.flag = true;

        // 监听异常事件
        this.client.on('close', () => {
            this.flag = false;
            debug('mq connect close');

            // 重连操作
            recon();
        });

        this.client.on('error', (err) => {
            debug('Error in mq connection: ' + err);
        });

        // 创建通道
        this.channel = await this.client.createChannel();
        // 生产者
        if (type == 0) {
            // 声明一个交换机
            await this.channel.assertExchange(this.config.exchange, this.config.mode, {confirm: false});
        }

        debug('mq connected');
    }

    /**
     * 断开连接
     */
    rmq.prototype.close = async () => {
        // 收集所有队列
        let queue = this.type == 0? this.config.describe.add(...this.config.routekey.keys()) : this.config.describe;
        // 删除队列
        for (let item of queue) {
            this.channel.deleteQueue(item);
        }

        if (this.type == 0) {
            this.channel.deleteExchange(this.config.exchange, this.config.mode);
        }
        // this.channel.close();
        // this.client.close();
    }

    /**
     * 消息订阅
     * @param {String} 队列名称
     */
    rmq.prototype.consume = async (queue) => {
        // 声明队列
        await this.channel.assertQueue(queue, {autoDelete: true});
        // 消息订阅
        await this.channel.consume(queue, (msg) => {
            if (!msg) {
                return;
            }

            let content = new Buffer(msg.content).toString();
            this.emit('msg', msg.fields.exchange, msg.fields.routingKey, content);
        });

        this.config.describe.add(queue);
    }

    /**
     * 定义路由关键字
     * 生产者使用
     */
    rmq.prototype.routeKey = async (queue, key) => {
        // 记录路由字，用于重连
        this.config.routekey.set(queue, key);
        // 声明队列
        await this.channel.assertQueue(queue, {autoDelete: true});
        this.channel.bindQueue(queue, this.config.exchange, key);
    }

    /**
     * 消息投递
     * @param {Object} data 消息内容
     * @param {String} type 路由关键字
     */
    rmq.prototype.send = (data, type) => {
        if (!this.flag) {
            debug('wait connect');
            return;
        }

        this.channel.publish(this.config.exchange, type, new Buffer(JSON.stringify(data)), {expiration: 120000});
    }
}

util.inherits(rmq, EventEmitter);

exports = module.exports = rmq;
