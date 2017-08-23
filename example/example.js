/**
 * Created by Nothing on 2017/6/1.
 */


const logger = require('../index').logger('example');
const cache = require('../index').cache;
const request = require('../index').request;
const tools = require('../index').tools;
const rmq = require('../index').rmq;
const etcd = require('../index').etcd;

process.on('unhandledRejection', (reason, p) => {
    logger.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

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

    // testRmq("amqp://guest:guest@192.168.1.173:9672?heartbeat=60");

}

(async () => {

    logger.debug('123');

    await cache.init('127.0.0.1', 6379);
    await cache.set('1', 'hello');
    logger.debug('cache 1 = ', await cache.get('1'));

    let html = await request.call('http://www.baidu.com');
    logger.debug('baidu: ', html);

    logger.debug(tools.formatTime({exp: 'YYYY-MM-DD'}));
    logger.debug(tools.sysinfo());
    logger.debug(await tools.exec('netstat -an'));
    

    let v = await request.call('http://127.0.0.1:2379/v2/keys/testjson');
    logger.debug(v.body.node.value);


    v = await request.call({
        url : 'https://127.0.0.1:8989',
        rejectUnauthorized : false
    }
    );

    logger.debug(v.body);

})();



