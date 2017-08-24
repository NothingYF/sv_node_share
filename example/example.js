/**
 * Created by Nothing on 2017/6/1.
 */

const logger = require('../index').logger('example');
process.on('unhandledRejection', (reason, p) => {
    logger.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});


//require('./example.cache');
//require('./example.etcd');
//require('./example.request');
//require('./example.tools');
//require('./example.valiadate');
//require('./example.rmq');




