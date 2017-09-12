/**
 * Created by Nothing on 2017/6/1.
 */

const logger = require('../index').logger('example');
const logger2 = require('../index').logger('example2');
const LOG_LEVELS = { DEBUG : 0, INFO : 1, WARN : 2, ERROR : 3, OPERATOR : 4};

process.on('unhandledRejection', (reason, p) => {
    logger.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

logger.debug('a1', 1, 2);
logger.set_level(LOG_LEVELS.INFO);
logger.debug('a1 hide');

logger2.debug('b1 debug', '3');

logger2.info('b1 info', '4');

logger.log(LOG_LEVELS.INFO, 'test log()', {result : 'ok'}, 1000);

//require('./example.cache');
//require('./example.etcd');
//require('./example.request');
//require('./example.tools');
//require('./example.valiadate');
//require('./example.rmq');




