const rmq = require('../index').rmq;
const tools = require('../index').tools;
const logger = require('../index').logger('rmq');

const testRmq = async (url, exchange)=> {
    // 创建consumer
    let consumer = new rmq();
    await consumer.connect(url);

    // 消息订阅
    await consumer.consume('consumer');

    // 接收消息
    consumer.on('msg', (exchange, route, msg) => {
        logger.info('receive msg from', exchange, '->', route, ':', msg);
    });

    // 创建producer
    // 0-生产者，1-消费者
    let type = 0;
    let producer = new rmq(type, exchange, 'direct');
    await producer.connect(url);

    // 绑定路由字
    producer.routeKey('consumer', 'key');

    // 发送消息
    setInterval(() => {
        producer.send({exchange: exchange, time: tools.formatTime()}, 'key');
    }, 5000);

    // 关闭mq
    // setTimeout(() => {
    //     logger.error('close.......');
    //     producer.close();
    //     consumer.close();
    // }, 5000);
}

process.on('uncaughtException', (err) => {
    // handle the error safely
    logger.error('error', err);
});

process.on('unhandledRejection', (reason, p) => {
    //logger.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
    logger.error('error', `Unhandled Rejection at: Promise ${p}, reason: ${reason}`);
});

(async () => {
    await testRmq("amqp://guest:guest@192.168.1.173:8672?heartbeat=60", '8672');
    await testRmq("amqp://guest:guest@192.168.1.173:9672?heartbeat=60", '9672');
})();

