const cache = require('../index').cache;
const logger = require('../index').logger('cache');


const example = async() =>{
    try{
        await cache.init('127.0.0.1', 6379);

        await cache.set('v1', '100', 10);
        await cache.set('v2', '200', 10);
        logger.debug('v1', await cache.get('v1'));

        logger.debug(await cache.keys('v*'));

        //高级命令集
        await advance_command();

    }catch(e){
        logger.error(e);
    }
};

const advance_command = async()=>{
    let o = cache.redis();
    await o.set('a1', 'hello1');
    await o.setex('a2', 10, 'hello');

    logger.debug('cache.get', await o.get('a2'));
    logger.debug('cache.keys', await o.keys('a*'));

    await o.sadd('set1', '1');
    logger.debug('cache.sismember', await o.sismember('set1', '1'));

    let n = { a: 123};
    await o.hset('h1', JSON.stringify(n), '1');
    await o.hset('h1', 'abc', 'a2');
    await o.hset('h2', '1', '100');
    await o.hset('h2', '2', '200');

    logger.debug('cache.hget', await o.hget('h1', 'abc'));
    logger.debug('cache.hmget', await o.hmget('h2', '1', '2'));
};

example();