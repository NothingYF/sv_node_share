const crypto = require('crypto');
const tools = require('../index').tools;
const logger = require('../index').logger('tools');

const example = async()=>{
    logger.debug(tools.formatTime({exp: 'YYYY-MM-DD'}));

    // 密钥补齐
    let key = "0123456" + String.fromCharCode(0);
    let content = "qazwsx0123456789";
    let iv = "12345678";

    logger.info('明文：', content);
    logger.info('密钥：', key);
    logger.info('偏移：', iv);

    let algorithm = ['des-cbc', 'des-ecb'];
    for (let item of algorithm) {
        let encode = tools.encryptEx(item, content, key, iv);
        let decode = tools.decryptEx(item, encode, key, iv);

        logger.info(item, '加密：', encode);
        logger.info(item, '解密：', decode);
    }
};

example();