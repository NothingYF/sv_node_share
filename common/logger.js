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
			maxLogSize: 100<<20,
			backUps: 30
        }
    ]
});

var logger = function (category) {

    //实例化对象
    if(!(this instanceof logger)){
        return new logger(category);
    }

    var env = process.env.NODE_ENV || "development";

    let level = 'DEBUG';
    if(env == 'test'){
        level = 'ERROR';
    }else if(env == 'product'){
        level = 'INFO';
    }

    var o = log4js.getLogger(category);
    o.setLevel(level);
    return o;
};

module.exports = logger;

