const redis_client = require('./redis');
const logger = require('./logger')('cache');
const debug = require('debug')('cache');

var redis = null;

/**
 * 初始化Redis缓存连接(需在接口调用之前进行调用)
 * @param host
 * @param port
 * @param db
 */
const init = async (host, port, db) => {
    try{
        redis = await redis_client.init(host, port, db);
        logger.info('redis ready');
    }catch(err){
        logger.error('connect to redis error, check your redis config', err);
    }
};

/**
 * 获取缓存数据
 * @param key 关键字
 * @returns {Promise} 缓存数据
 */
const get = (key) => {
    return new Promise(function (resolve, reject) {
        let t = new Date();
        redis.get(key, function (err, data) {
            if (err) {
                return reject(err);
            }
            if (!data) {
                return resolve();
            }
            data = JSON.parse(data);
            let duration = (new Date() - t);
            logger.info('cache', 'get', key, duration + 'ms');
            resolve(data);
        });
    });
};

/**
 * 设置缓存数据
 * @param key 关键字
 * @param value 对象值
 * @param time 失效时间，秒为单位(默认为1天)）
 * @returns {Promise}
 */
const set = (key, value, time = 86400) => {
    return new Promise(function (resolve, reject) {
        value = JSON.stringify(value);
        // 设置默认过期时间

        if (!time) {
            redis.set(key, value, function (err) {
                if(err){
                    reject(err);
                }else{
                    resolve();
                }
            });
        } else {
            redis.setex(key, time, value, function (err) {
                if(err){
                    reject(err);
                }else{
                    resolve();
                }
            });
        }
    });
};

/**
 * 设置缓存失效时间
 * @param key
 * @param time 时间，秒为单位
 * @returns {Promise}
 */
const expire = (key, time) => {
    return new Promise(function (resolve, reject) {
        redis.expire(key, time, function (err) {
            if(err){
                reject(err);
            }else{
                resolve();
            }
        });
    });
};

/**
 * 删除key
 * @param key
 * @returns {Promise}
 */
const del = (key) => {
    return new Promise(function (resolve, reject) {
        let t = new Date();
        redis.del(key, function (err, data) {
            if (err) {
                return reject(err);
            }
            
            let duration = (new Date() - t);
            logger.info('cache', 'del', key, duration + 'ms');
            resolve(data);
        });
    });
};

/**
 * 获取所有匹配key
 * @param key 关键字
 * @returns {Promise}
 */
const keys = function(key) {
    return new Promise(function (resolve, reject) {
        let t = new Date();
        redis.keys(key, function (err, data) {
            if (err) {
                return reject(err);
            }
            if (!data) {
                return resolve();
            }
            
            let duration = (new Date() - t);
            logger.info('cache', 'get', key, duration + 'ms');
            resolve(data);
        });
    });
};

//初始化cache系统
exports.init = init;

// 获取所有匹配key
exports.keys = keys;

// 删除key
exports.del = del;

// 读取缓存数据
exports.get = get;

// 设置缓存数据
exports.set = set;

// 设置缓存失效时间
exports.expire = expire;
