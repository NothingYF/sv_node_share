/**
 * Created by Nothing on 2017/6/1.
 */


const logger = require('../index').logger('example');
const cache = require('../index').cache;
const request = require('../index').request;
const tools = require('../index').tools;

//logger.debug('123');
(async () => {
    await cache.init('127.0.0.1', 6379);
    await cache.set('1', 'hello');
    logger.debug('cache 1 = ', await cache.get('1'));

    let html = await request.call('http://www.baidu.com');
    logger.debug('baidu: ', html);

    logger.debug(tools.formatTime({exp: 'YYYY-MM-DD'}));
    logger.debug(tools.sysinfo());
    logger.debug(await tools.exec('netstat -an'));
})();



