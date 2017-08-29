const rmq = require('../index').rmq;
const tools = require('../index').tools;
const logger = require('../index').logger('rmq');

const testRmq = async (url, exchange)=> {
    // 创建consumer
    let consumer = new rmq();
    await consumer.connect(url);

    // 消息订阅
    await consumer.consume('consumer1');
    await consumer.consume('consumer2');

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
    producer.routeKey('consumer1', 'key1');
    // producer.routeKey('consumer2', 'key2');

    // 发送消息
    setInterval(() => {
        producer.send({exchange: exchange, time: tools.formatTime()}, 'key1');
        // producer.send({exchange: exchange, time: tools.formatTime()}, 'key2');
    }, 10000);

    // 关闭mq
    // setTimeout(() => {
    //     logger.error('close.......');
    //     producer.close();
    //     consumer.close();
    // }, 5000);
}

(async () => {
    await testRmq("amqp://guest:guest@192.168.1.173:8672?heartbeat=60", '8672');
    await testRmq("amqp://guest:guest@192.168.1.173:9672?heartbeat=60", '9672');
})();

