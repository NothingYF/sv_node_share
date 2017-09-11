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
const yaml = require('js-yaml');
const Etcd = require('./etcd');
const logger = require('./logger')('config');

var _config = null;

const rawLoad = (path)=>{

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

    return content;
}

const load = (path, etcd_keys = null, onreload = null)=>{
    try{

        if(_config)
            return _config;

        let content = rawLoad(path);

        if(!etcd_keys)
            return _config;

        var etcd = Etcd(_config.etcd);

        let key = `/config`;
        for(let o of etcd_keys){
            let val = _config[o];
            if(!val){
                logger.error(`config file error, not found field: ${o}`);
                return _config;
            }

            key += '/' + val;
        }

        logger.info('upload config to remote: ', _config.etcd + key);

        etcd.set(key, content).then(()=>{
            logger.debug('upload ok');
            let watcher = etcd.watcher(key);
            //监听配置更新
            watcher.on("set", (o)=> {
                logger.info('remote config changed, save and reload local config');
                if(o && o.node && o.node.value){
                    //配置已更新，修改本地配置并重新加载
                    fs.writeFile(path, o.node.value, (err)=>{
                        if(!err){
                            process.nextTick(()=>{
                                rawLoad(path);
                                if(onreload)
                                    onreload(_config);
                            });
                        }else{
                            logger.error(err);
                        }
                    });
                }else{
                    logger.error('error body');
                }
            });
            watcher.on('errpr', (err)=>{
               logger.error('config watcher error:', err);
            });
        }).catch((err)=>{
            logger.error(err);
        });

    }catch(e){
        logger.error(e);
    }

    return _config;
};

exports.load = load;