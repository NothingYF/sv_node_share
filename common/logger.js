const fs = require('fs');
const path = require('path');
const log4js = require('log4js');

fs.mkdir('logs', function(){});

const LOG_LEVELS = { DEBUG : 0, INFO : 1, WARN : 2, ERROR : 3, OPERATOR : 4};
exports.LOG_LEVELS = LOG_LEVELS;

//全局日志级别（运行动态改变）
var _loglevel = LOG_LEVELS.DEBUG;

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

function logger(category) {

    //实例化对象
    if(!(this instanceof logger)){
        return new logger(category);
    }

    this._log = log4js.getLogger(category);
    this._log.setLevel('DEBUG');

    /**
     * 设置全局日志级别
     * @param level
     */
    logger.prototype.setLevel = function (level) {
        _loglevel = level;
    }

    /**
     * debug输出
     */
    logger.prototype.debug = function () {
        if(_loglevel > LOG_LEVELS.DEBUG){
            return;
        }

        this._log.debug.apply(this._log, arguments);
    }

    /**
     * info输出
     */
    logger.prototype.info = function () {
        if(_loglevel > LOG_LEVELS.INFO){
            return;
        }

        this._log.info.apply(this._log, arguments);
    }

    /**
     * warn输出
     */
    logger.prototype.warn = function () {
        if(_loglevel > LOG_LEVELS.WARN){
            return;
        }
        this._log.warn.apply(this._log, arguments);

    }

    /**
     * info输出
     */
    logger.prototype.error = function () {
        if(_loglevel > LOG_LEVELS.ERROR){
            return;
        }
        this._log.warn.apply(this._log, arguments);
    }

    return this;
};

module.exports = logger;

