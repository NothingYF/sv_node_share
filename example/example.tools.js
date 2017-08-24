const tools = require('../index').tools;
const logger = require('../index').logger('tools');

const example = async()=>{
    logger.debug(tools.formatTime({exp: 'YYYY-MM-DD'}));
    logger.debug(tools.sysinfo());
    logger.debug(await tools.exec('netstat -an'));
};

example();