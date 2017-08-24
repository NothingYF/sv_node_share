const cache = require('../index').cache;
const logger = require('../index').logger('cache');

const example = async() =>{
    await cache.init('127.0.0.1', 6379);
    await cache.set('1', 'hello');
    logger.debug('cache 1 = ', await cache.get('1'));
};

example();