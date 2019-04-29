const rmq = require('../index').rmq;
const tools = require('../index').tools;
const logger = require('../index').logger('rmq');

/**
 * topic模式
 * @param {String} url mq服务器连接地址
 * @param {String} exchange 交换机名称
 */
const TopicRmq = async (url, exchange) => {
    // 创建producer
    // 0-生产者，1-消费者
    let type = 0;
    // let producer = new rmq(type, exchange + '.topic', 'topic');
    // await producer.connect(url);
    //
    // // 发送消息
    // setInterval(() => {
    //     producer.send({"Gateway":"5be10f783754c1fe80810d5000000006","PlateNumber":"湘AY4110","State":786435,"Longitude":112.53946,"Latitude":27.913332,"Altitude":64,"GPSSpeed":21,"Direction":230,"Time":"2019-02-26T09:32:07Z","Extra":{"Mileage":280239,"Oil":0,"DashSpeed":0,"ManConfirm":0,"ExtraState":0,"IOState":0,"Analog":4980812,"RSSI":5,"Satellites":18},"Alarms":[{"Type":12,"Data":null},{"Type":25,"Data":null},{"Type":28,"Data":null}]},
    //     'gw.track');
    // }, 1000);

    // 创建consumer
    type = 1;
    let consumer = new rmq(type, exchange + '.topic');
    await consumer.connect(url);

    // 声明队列
    await consumer.assertQueue('client123');
    await consumer.bindQueue('client123', '#');
    // await consumer.bindQueue('client', 'client.dws.status.SFZ------DSP00000001');

    // 消息订阅
    await consumer.consume('client123');

    // 接收消息
    consumer.on('msg', (exchange, route, msg) => {
        logger.info('receive msg from', exchange, '->', route, ':', msg);
    });
}

/**
 * fanout模式
 * @param {String} url mq服务器连接地址
 * @param {String} exchange 交换机名称
 */
const FanoutRmq = async (url, exchange) => {
    // 创建producer
    // 0-生产者，1-消费者
    let type = 0;
    let producer = new rmq(type, exchange, 'fanout');
    await producer.connect(url);

    // 声明队列
    await producer.assertQueue('Test', true);

    // 发送消息
    // setInterval(() => {
    //     producer.send({exchange: exchange, time: tools.formatTime()}, 'bigdata');
    // }, 5000);

    // 创建consumer
    let consumer = new rmq(type, exchange, 'fanout');
    await consumer.connect(url);

    // 声明队列
    await consumer.assertQueue('client1', true);
    // 消息订阅
    await consumer.consume('client1');

    // 接收消息
    consumer.on('msg', (exchange, route, msg) => {
        logger.info('receive msg from', exchange, '->', route, ':', msg);
    });

    // 创建consumer
    // let consumer2 = new rmq(type, exchange + '.fanout', 'fanout');
    // await consumer2.connect(url);
    //
    // // 声明队列
    // await consumer2.assertQueue('client2', true);
    // // 消息订阅
    // await consumer2.consume('client2');
    //
    // // 接收消息
    // consumer2.on('msg', (exchange, route, msg) => {
    //     logger.error('receive msg from', exchange, '->', route, ':', msg);
    // });
}

/**
 * direct模式
 * @param {String} url mq服务器连接地址
 * @param {String} exchange 交换机名称
 */
const DirectRmq = async (url, exchange) => {
    // 创建consumer
    let consumer = new rmq();
    await consumer.connect(url);

    // 声明队列-避免队列不存在异常
    await consumer.assertQueue('LowerDevInfo');
    // 消息订阅
    await consumer.consume('LowerDevInfo');

    // 接收消息
    consumer.on('msg', (exchange, route, msg) => {
        logger.info('receive msg from', exchange, '->', route, ':', msg);
    });

    // // 创建producer
    // // 0-生产者，1-消费者
    // let type = 0;
    // let producer = new rmq(type, exchange + '.direct', 'direct');
    // await producer.connect(url);

    // 定义路由关键字
    // producer.routeKey('direct-xx', 'direct-key');

    // 发送消息
    // setInterval(() => {
    //     producer.sendToQueue({exchange: exchange, time: tools.formatTime()}, 'direct-xx');
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
    await TopicRmq("amqp://guest:guest@ty1.scsv.online:10672?heartbeat=60", 'chenghua');
    // await DirectRmq("amqp://guest:guest@192.168.1.186:1062?heartbeat=60");
})();

