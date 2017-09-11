const config = require('../index').config;
const logger = require('../index').logger('config');


var cfg = config.load(__dirname + '/config.yml', ['type', 'sn'], (data)=>{
    logger.set_level(data.debug ? logger.levels.DEBUG : logger.levels.INFO);
});


setInterval(()=>{
   logger.debug(cfg);
   logger.info('info');
}, 5000);