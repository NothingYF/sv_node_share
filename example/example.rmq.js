const rmq = require('../index').rmq;

const testRmq = async (url)=> {
    // // 创建consumer
    // let consumer = new rmq();
    // await consumer.connect(url);
    //
    // // 消息订阅
    // await consumer.consume('example');
    // await consumer.consume('test');
    //
    // // 接收消息
    // consumer.on('msg', (exchange, route, msg) => {
    //     logger.info('receive msg from', exchange, '->', route, ':', msg);
    // });

    // 创建producer
    // 0-生产者，1-消费者
    let type = 0;
    let producer = new rmq(type, 'cms', 'direct');
    await producer.connect(url);

    // 绑定路由字
    producer.routeKey('example', 'key1');
    producer.routeKey('test', 'key2');

    // 发送消息
    for (let i = 0; i < 4; ++i) {
        if (i % 2 == 0) {
            await producer.send({queue: 'example', n: i}, 'key1');
        } else {
            await producer.send({queue: 'test', n: i}, 'key2');
        }
    }

    // 关闭mq
    // setTimeout(() => {
    //     logger.error('close.......');
    //     producer.close();
    //     // consumer.close();
    // }, 5000);

}

// testRmq("amqp://guest:guest@192.168.1.173:9672?heartbeat=60");

