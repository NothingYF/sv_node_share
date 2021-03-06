/**
 * Created by Nothing on 2017/6/7.
 * ETCD平台配置，路径为/config/#srv_type/#sn。
 * 特性如下：
 *  1、程序加载时上传本地配置至ETCD
 *  2、监听ETCD配置更改事件，远端修改配置后，本地同步修改并加载
 *
 * 使用要求：
 *  1、必须采用yaml格式配置文件（注意缩进只允许采用空格符，不允许tab。某些IDE如Webstorm，会将tab默认转为空格处理）
 *  2、配置文件中需包含etcd_keys参数所指定属性，由于生成key路径
 */

const fs = require('fs');
const path = require('path');
const mzfs = require('mz/fs');
const yaml = require('js-yaml');
const Etcd = require('./etcd');
const tools = require('./tools');
const logger = require('./logger')('config');

const ETCD_DEFAULT = 'http://127.0.0.1:2379';
var _config = null;
var _cfgPath = null;

const raw_load = (path, onload)=>{
    _cfgPath = path;

    let content = fs.readFileSync(path, {encoding: 'utf8'});
    if(!content){
        logger.error('config content error');
        return null;
    }

    let config = yaml.safeLoad(content);

    if(config){
        //_config = JSON.parse(JSON.stringify(config));
        if(_config){
            //已存在config的情况下，不能直接修改对象引用，应修改对象属性以便外部引用config生效
            for(var o in config) {
                _config[o] = config[o];
            }
        } else{
            _config = config;
        }

        logger.info('config load success');
    }
    else{
        logger.error('config load error');
    }

    process.nextTick(onload.bind(this, _config));

    return content;
}

const load = (path, etcd_keys = null, onload = null, reload = false)=>{
    try{
        if(!reload && _config)
            return _config;

        let content = raw_load(path, onload);

        if(!etcd_keys)
            return _config;

        let etcd_url = _config.etcd;
        if(etcd_url)
            Etcd.set_url(etcd_url);
        var etcd = Etcd();

        let key = `/config`;
        for(let o of etcd_keys){
            let val = _config[o];
            if(!val){
                logger.error(`config file error, not found field: ${o}`);
                return _config;
            }

            key += '/' + val;
        }

        logger.info('uploading config to remote: ',
            (etcd_url == undefined ? ETCD_DEFAULT : etcd_url) + '/v2/keys' + key);

        etcd.set(key, content).then(()=>{
            logger.info('config upload ok');
            etcd.watch(key, function onchange(err, o){

                if(o && o.action == 'set'){
                    logger.info('remote config changed, save and reload local config');
                    if(o && o.node && o.node.value){
                        //配置已更新，修改本地配置并重新加载
                        fs.writeFile(path, o.node.value, (err)=>{
                            if(!err){
                                process.nextTick(raw_load.bind(this, path, onload));
                            }else{
                                logger.error(err.message || err);
                            }
                        });
                    }else{
                        logger.error('error body');
                    }
                }

            });
        }).catch((err)=>{
            logger.warn('upload config failed, please check etcd config');
            //logger.error(err);
        });

    }catch(e){
        logger.error(e);
    }

    return _config;
};

/**
 * 修改配置文件
 * @param {String} cfgpath 配置文件路径
 * @param {Array} data 修改内容
 * * [{key: 'platform.local.name', value: '收费站'}]
 * @param {Number} backup 备份数量
 */
const updateByPath = async (cfgpath, data, backup = 5) => {
    let content = await mzfs.readFile(cfgpath, {encoding: 'utf8'});
    let cfgarray = content.split('');

    // 数据格式不正确
    if (!data instanceof Array) {
        logger.error('update config error:', data);
        return;
    }

    // 数据遍历
    for (let item of data) {
        let index = 0;
        let node = null;
        let target = null;
        let keys = item.key.split('.');

        // 查找结点位置
        for (let key of keys) {
            let reg = new RegExp(key + ':[^//][^#(\r)(\n)]*', 'g')
            reg.lastIndex = index;

            let res = reg.exec(content);
            // 未找到
            if (!res) {
                logger.error(`update config: ${item.key}->${key} not found`);
                break;
            }

            // 记录最后一个key
            node = key;

            // 记录位置
            index = res.index;
            target = res[0];
        }

        // 未找到
        if (!node) {
            continue;
        }

        // 修改value
        cfgarray.splice(index, target.length, ...`${node}: ${item.value + ' '}`.split(''));
        content = cfgarray.join('');
    }

    // 备份配置文件，同级目录cfgbk
    if (backup) {
        await tools.FileBackUp(cfgpath, 'cfgbk');
    }

    // 更新文件内容
    await mzfs.writeFile(cfgpath, content);
}

const update = async (data, backup = 5) => {
    return await updateByPath(_cfgPath, data, backup)
}

exports.load = load;
exports.update = update;
exports.updateByPath = updateByPath;
