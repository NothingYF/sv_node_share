const config = require('../index').config;
const logger = require('../index').logger('config');
const LOG_LEVELS = { DEBUG : 0, INFO : 1, WARN : 2, ERROR : 3, OPERATOR : 4};

var cfg = config.load(__dirname + '/config.yml', ['type', 'sn'], (data)=>{
    logger.setLevel(data.debug ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO);
});


setInterval(()=>{
   logger.debug(cfg);
   logger.info('info');
}, 5000);