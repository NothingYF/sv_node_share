/**
 * Created by Nothing on 2017/6/1.
 */
const path = require('path');
const iconv = require('iconv-lite');
const moment = require('moment');
const fse = require('fs-extra');
const mzfs = require('mz/fs');
const os = require('os');
const crypto = require('crypto');
const child_process = require('child_process');

moment.locale('zh-cn');

Date.prototype.format = function(fmt) {
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}


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

/**
 * 替换字符串（非正则表达式实现）
 * @param from  需替换的字符串
 * @param to 替换后字符串
 * @returns {string} 替换后字符串
 */
String.prototype.replaceAll = function (from, to) {
    let i = 0;
    let j = 0;
    let s = '';
    while(true){
        i = this.indexOf(from, j);
        if(i == -1){
            s += this.substr(j);
            break;
        }
        s += this.substr(j, i - j);
        s += to;
        i += from.length;
        if(i >= this.length)
            break;
        j = i;
    }
    return s;
}

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

/**
 * 执行命令
 * @param cmd 命令参数
 * @returns {Promise}
 */
const exec = function (cmd) {
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
const sysinfo = function () {
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
const encrypt = function (str, secret) {
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
const decrypt = function (str, secret) {
    var decipher = crypto.createDecipher('aes192', secret);
    var dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

/**
 * 加密
 * @param algorithm 加密算法
 * @param str       加密内容
 * @param secret    密钥
 * @param iv        偏移
 */
const encryptEx = function (algorithm, str, secret, iv = null) {
    let vt = (iv && (algorithm != 'des-ecb'))? iv : 0;
    let cipher = crypto.createCipheriv(algorithm, secret, new Buffer(vt));
    let enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
};

/**
 * 解密
 * @param algorithm 解密算法
 * @param str       解密内容
 * @param secret    密钥
 * @param iv        偏移
 */
const decryptEx = function (algorithm, str, secret, iv = null) {
    let vt = (iv && (algorithm != 'des-ecb'))? iv : 0;
    let decipher = crypto.createDecipheriv(algorithm, secret, new Buffer(vt));
    let dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

/**
 * MD5 Hash
 * @param str
 * @returns {*}
 */
const md5 = function (str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
};

/**
 * 判断两个IP地址是否在同一个网段
 * @param  {String}  addr1 地址一
 * @param  {String}  addr2 地址二
 * @param  {String}  mask  子网掩码
 */
const isSameNetSeg = (addr1, addr2, mask) => {
    if(!addr1 || !addr2 || !mask){
        return false;
    }

    addr1 = addr1.split(".");
    addr2 = addr2.split(".");
    mask  = mask.split(".");

    // 格式错误
    if (addr1.length != addr2.length || addr1.length != mask.length || addr1.length != 4) {
        return false;
    }

    for(let i = 0; i < 4; ++i){
        if ((parseInt(addr1[i]) & parseInt(mask[i])) != (parseInt(addr2[i]) & parseInt(mask[i]))) {
            return false;
        }
    }

    return true;
}

/**
 * 递归创建目录
 */
const mkdirs = async (dir) => {
    let exists = await mzfs.exists(dir);
    if (exists) {
        return true;
    } else {
        let res = await mkdirs(path.dirname(dir));
        if (res) {
            await mzfs.mkdir(dir);
            return true;
        }
    }
}

/**
 * 参数替换
 */
const paramFormat = function () {
    if (arguments.length == 0) {
        return;
    }

    if (arguments.length == 1) {
        return arguments[0];
    }

    let param = arguments[0];
    for(let i = 1; i < arguments.length; i++) {
        param = param.replace(new RegExp("\\{"+i+"\\}","g"), arguments[i]);
    }

    return param;
}

/**
 * 文件备份
 * @param {String} file 文件名（绝对路径）
 * @param {String} bkdir 备份目录（同级目录下文件夹）
 * @param {Number} bknum 备份文件数
 */
const FileBackUp = async (file, bkdir, bknum = 5) => {
    // 备份配置文件，同级目录cfgbk
    let pathObj = path.parse(file);
    let bkDir = path.join(pathObj.dir, bkdir);
    let exist = await mzfs.exists(bkDir);
    if (!exist) {
        await mzfs.mkdir(bkDir);
    } else {
        // 重名命已有文件
        let tmpFiles = [];
        let files = await mzfs.readdir(bkDir);
        for (let item of files) {
            tmpFiles.push('bk_' + item);
            await mzfs.rename(path.join(bkDir, item), path.join(bkDir, 'bk_' + item));
        }

        for (let item of tmpFiles) {
            // config.yml.0
            let index = item.lastIndexOf('.');
            if (item.substr(index) == pathObj.ext) {
                await mzfs.rename(path.join(bkDir, item), path.join(bkDir, pathObj.base + '.' + 1));
            } else {
                // 计算文件序号
                let no = parseInt(item.substr(index + 1)) + 1;

                // 超出备份数量
                if (no > bknum) {
                    await mzfs.unlink(path.join(bkDir, item));
                    continue;
                }

                await mzfs.rename(path.join(bkDir, item), path.join(bkDir, pathObj.base + '.' + no));
            }
        }
    }

    // 备份当前文件
    await mzfs.copyFile(file, path.join(bkDir, pathObj.base));
}

/**
 * 字符串解析(server: "type=dws;sn=xxx")
 * @param {String} data 解析内容
 * @param {String} delimiter 分隔符
 * @param {String} assignment 复制符
 */
const stringParser = (data, delimiter, assignment) => {
    let value = data.split(delimiter);
    let keyValue = new Map();

    for (let item of value) {
        let tmp = item.split(assignment);

        keyValue.set(tmp[0], tmp[1]);
    }

    return keyValue;
}

/**
 * 取百分比
 * numerator：分子
 * denominator: 分母
 */
const percent = (numerator, denominator) => {
    // 避免出现分母为0的情况
    if (!denominator) {
        denominator = 1;
    }

    // 小数点后保留两位
    let value = numerator*100/denominator;
    if (Number.isInteger(value)) {
        return value;
    } else {
        return value.toFixed(2);
    }
}

/**
 * 取当前时间到零点时间差
 */
const ticks = () => {
    // 24小时转ms
    let dayMs = 86400000;
    // 已经过ms
    let go = new Date().getTime() - ZeroTime({ms: true});

    return dayMs - go;
}

/**
 * 取零点时间戳
 */
const ZeroTime = (opt = {}) => {
    let time = opt.time || new Date();
    let ms = opt.ms || false;

    // 置零时分秒
    time.setHours(0);
    time.setMinutes(0);
    time.setSeconds(0);
    time.setMilliseconds(0);

    return ms? time.getTime(): time.getTime()/1000;
}

/**
 * ObjectId合法性校验
 */
const IsObjectId = (Id) => {
    return ObjectId.isValid(Id);
}

/**
 * 读取文件输出base64编码
 */
const FileBase64 = (file) => {
    let data = fse.readFileSync(path.resolve(file));
    return new Buffer(data).toString('base64');
}

/**
 * 获取整点时间
 */
const OClockTIme = (time) => {
    let hour = new Date(time).getHours();
    return hour + ':00';
}

module.exports = {
    // 判断是否为JSON对象
    isJSON,
    // 延时
    sleep,
    // 格式化时间
    formatTime,
    // 复制文件及目录
    copy,
    // 执行命令
    exec,
    // 获取系统信息
    sysinfo,
    // AES加密
    encrypt,
    // AES解密
    decrypt,
    encryptEx,
    decryptEx,
    // MD5 Hash
    md5,
    // 判断两个IP地址是否在同一个网段
    isSameNetSeg,
    // 递归创建目录
    mkdirs,
    // 参数替换
    paramFormat,
    // 文件备份
    FileBackUp,
    // 字符串解析(server: "type=dws;sn=xxx")
    stringParser,
    // 取百分比
    percent,
    // 取当前时间到零点时间差
    ticks,
    // 取零点时间戳
    ZeroTime,
    // ObjectId合法性校验
    IsObjectId,
    // 读取文件输出base64编码
    FileBase64,
    // 获取整点时间
    OClockTIme
};