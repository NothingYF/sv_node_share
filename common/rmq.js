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
class rmq extends EventEmitter {
    constructor(type = 1, exchange = 'server', mode = 'direct') {
        super();

        // 配置参数
        this.config = {
            // 类型
            type: type,
            // 消息订阅
            describe: new Set()
        };

        // 连接标志
        this.flag = false;
        // 通道
        this.channel = null;
        // 定时器ID
        this.timer = null;
        // 客户端实例
        this.client = null;

        // exchange name
        this.config.exchange = exchange;
        // 数据分发模式
        this.config.mode = mode;
        // 路由关键字
        this.config.routekey = new Map();
    }

    /**
     * 连接mq服务器
     * @param {String} 服务器连接地址
     */
    async connect(url) {
        debug('connect to', url);

        this.url = url;
        this.client = await mq.connect(this.url);
        this.flag = true;

        // 监听异常事件
        this.client.on('close', () => {
            this.flag = false;
            debug('mq connect close');

            // 重连操作
            recon.call(this);
        });

        this.client.on('error', (err) => {
            debug('Error in mq connection: ' + err);
        });

        // 创建通道
        this.channel = await this.client.createChannel();
        // 生产者
        if (this.config.type == 0) {
            // 声明一个交换机
            await this.channel.assertExchange(this.config.exchange, this.config.mode, {confirm: false});
        }

        debug(url, 'connected');
    }

    /**
     * 断开连接
     */
    async close() {
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
     * @param {String} queue 队列名称
     */
    async consume(queue) {
        // 消息订阅
        await this.channel.consume(queue, (msg) => {
            try {
                if (!msg) {
                    return;
                }

                let content = new Buffer(msg.content).toString();
                debug(msg.fields.exchange, msg.fields.routingKey, content);

                this.emit('msg', msg.fields.exchange, msg.fields.routingKey, content);
            } catch (e) {
                debug(e);
                this.emit('error', e);
            }
        });

        debug('consume', this.url, this.config.exchange, queue);
        this.config.describe.add(queue);
    }

    /**
     * 定义路由关键字
     * 生产者使用
     */
    async routeKey(queue, key) {
        // 记录路由字，用于重连
        this.config.routekey.set(queue, key);
        // 声明队列
        await this.channel.assertQueue(queue, {autoDelete: true});
        this.channel.bindQueue(queue, this.config.exchange, key);
    }

    /**
     * 声明队列
     * @param {String} queue 队列名称
     * @param {Boolean} binding 绑定交换机
     * @param {String} route 路由字/模糊匹配
     */
    async assertQueue(queue, binding = false, route) {
        await this.channel.assertQueue(queue, {autoDelete: true});

        if (binding) {
            await this.channel.bindQueue(queue, this.config.exchange, route);
        }
    }

    async bindQueue(queue, route) {
        await this.channel.bindQueue(queue, this.config.exchange, route);
    }

    /**
     * 消息投递-通过路由字分发
     * @param {Object} data   消息内容
     * @param {String} route   路由关键字
     * @param {String} expire 消息过期时间
     */
    async send(data, route, expire = 120000) {
        if (!this.flag) {
            debug('wait connect');
            return;
        }

        debug(this.url, route, data);
        this.channel.publish(this.config.exchange, route, new Buffer(JSON.stringify(data)), {expiration: expire});
    }

    /**
     * 消息投递-直接投递到队列
     * @param {Object} data   消息内容
     * @param {String} queue  队列名称
     * @param {String} expire 消息过期时间
     */
    async sendToQueue(data, queue, expire = 120000) {
        if (!this.flag) {
            debug('wait connect');
            return;
        }

        debug(this.url, queue, data);
        this.channel.sendToQueue(queue, new Buffer(JSON.stringify(data)), {expiration: expire});
    }
}

/**
 * 重连mq服务器
 */
const recon = async function(time = 10000) {
    if (this.timer) {
        return;
    }

    // 创建定时器
    this.timer = setInterval(async function(){
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

exports = module.exports = rmq;