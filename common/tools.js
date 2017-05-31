/**
 * Created by Nothing on 2017/6/1.
 */
const path = require('path');
const moment = require('moment');
const fse = require('fs-extra');
const os = require('os');
const crypto = require('crypto');
const child_process = require('child_process');

moment.locale('zh-cn');

/**
 * 判断是否为JSON对象
 * @param obj
 * @returns {boolean}
 */
const isJSON = function (obj) {
    var isjson = typeof(obj) == "object" &&
        Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
    return isjson;
};

exports.isJSON = isJSON;

/**
 * 延时
 * @param time
 * @returns {Promise}
 */
const sleep = function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    });
};

exports.sleep = sleep;

/**
 * 格式化时间
 */
const formatTime = (opt = {}) => {
    // 格式化时间
    let time = opt.time || Date.now();
    // 格式化样式
    let exp = opt.exp || 'YYYY-MM-DD HH:mm:ss';
    
    return moment(time).format(exp);
}

exports.formatTime = formatTime;


/**
 * 复制文件及目录
 * @param src
 * @param dst
 * @returns {Promise}
 */
const copy = (src, dst) => {
    return new Promise(function (resolve, reject) {
        fse.copy(src, dst, {clobber : true}, function (err) {
            if(err){
                reject(err);
            }else{
                resolve();
            }
        });
    });
}

exports.copy = copy;


/**
 * 执行命令
 * @param cmd 命令参数
 * @returns {Promise}
 */
exports.exec = function (cmd) {
    return new Promise(function (resolve, reject) {

        const bat = child_process.exec(cmd, {encoding : 'buffer'}, function (err, stdout, stderr) {
            if(err){
                return reject(err);
            }
            if(stdout || stderr){
                if(os.platform == 'win32'){
                    resolve(iconv.decode(stdout || stderr, 'GBK'));
                }else{
                    resolve((stdout||stderr).toString());
                }
            }
        });

    });
}

/**
 * 获取系统信息
 * @param cmd 命令参数
 * @returns {Promise}
 */
exports.sysinfo = function () {
    return {
        CPU: os.cpus(),
        OS: os.type() + ' ' + os.release(),
        Memory:{
            Total: Math.floor(os.totalmem() / (1024*1024)),
            Free: Math.floor(os.freemem() / (1024*1024))
        },
        network: os.networkInterfaces(),
        boottime: (moment().subtract(os.uptime()/60, 'm')).format('YYYY-MM-DD HH:mm:ss')
    };
}

/**
 * AES加密
 * @param str
 * @param secret
 * @returns {Query|Progress|*|{type, default}}
 */
exports.encrypt = function (str, secret) {
    var cipher = crypto.createCipher('aes192', secret);
    var enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
};

/**
 * AES解密
 * @param str
 * @param secret
 * @returns {Query|Progress|*|{type, default}}
 */
exports.decrypt = function (str, secret) {
    var decipher = crypto.createDecipher('aes192', secret);
    var dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

/**
 * MD5 Hash
 * @param str
 * @returns {*}
 */
exports.md5 = function (str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};

/**
 * 去除首尾指定字符
 * @param char 指定字符
 * @param type 首尾
 */
String.prototype.trim = function (char, type = 'right') {
    if (char) {
        if (type == 'left') {
            return this.replace(new RegExp('^\\'+char+'+', 'g'), '');
        } else if (type == 'right') {
            return this.replace(new RegExp('\\'+char+'+$', 'g'), '');
        }
        return this.replace(new RegExp('^\\'+char+'+|\\'+char+'+$', 'g'), '');
    }
    return this.replace(/^\s+|\s+$/g, '');
};