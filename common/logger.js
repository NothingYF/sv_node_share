const fs = require('fs');
const path = require('path');
const log4js = require('log4js');

fs.mkdir('logs', function(){});
log4js.configure({
    appenders: [
        {type: 'console'},
        {
            type: 'file',
            filename: path.join('logs', 'server.log'),
            maxLogSize: 20<<20,
            backUps: 30
        }
    ]
});

const LOG_LEVELS = { DEBUG : 0, INFO : 1, WARN : 2, ERROR : 3, OPERATOR : 4};

//全局日志级别（运行动态改变）
var _loglevel = LOG_LEVELS.DEBUG;

class logger{
    constructor(category){
        this.levels = LOG_LEVELS;
        this._log = log4js.getLogger(category);
        this._log.setLevel('DEBUG');
    }
    /**
     * 设置全局日志级别
     * @param level
     */
    set_level(level) {
        _loglevel = level;
    }

    /**
     * debug输出
     */
    debug() {
        if(_loglevel > LOG_LEVELS.DEBUG){
            return;
        }

        this._log.debug.apply(this._log, arguments);
    }

    /**
     * info输出
     */
    info() {
        if(_loglevel > LOG_LEVELS.INFO){
            return;
        }

        this._log.info.apply(this._log, arguments);
    }

    /**
     * warn输出
     */
    warn() {
        if(_loglevel > LOG_LEVELS.WARN){
            return;
        }
        this._log.warn.apply(this._log, arguments);

    }

    /**
     * info输出
     */
    error() {
        if(_loglevel > LOG_LEVELS.ERROR){
            return;
        }
        this._log.error.apply(this._log, arguments);
    }

}

function wrapper(category) {
    return new logger(category);
};

module.exports = wrapper;


