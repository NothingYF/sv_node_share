/**
 * Created by Nothing on 2017/6/1.
 */


const logger = require('../index').logger('example');
const cache = require('../index').cache;
const request = require('../index').request;
const tools = require('../index').tools;
const etcd = require('../index').etcd;

process.on('unhandledRejection', (reason, p) => {
    logger.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

//logger.debug('123');
(async () => {

    let body = await etcd.get('/status/ms/');
    logger.debug(body);

    for(let o of body){
        logger.debug(JSON.parse(o.value));
    }

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



