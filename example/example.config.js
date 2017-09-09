const config = require('../index').config;
const logger = require('../index').logger('config');


var cfg = config.load(__dirname + '/config.yml', ['type', 'sn']);


setInterval(()=>{
   logger.debug(cfg);
}, 5000);