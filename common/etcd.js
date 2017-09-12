/**
 * Created by Nothing on 2017/6/7.
 */

const debug = require('debug')('etcd');
const tools = require('./tools');
//const Etcd = require('node-etcd');
const Etcd = require('etcdjs');

const ETCD_MATCH = /http:\/\/(.+:\d+)/i;
var _global_etcd = '127.0.0.1:2379';

/**
 * ETCD Promise封装类
 */
class etcd{

    /**
     * 构造函数
     * @param url ETCD路径，
     */
    constructor(url = null){
        let u = _global_etcd;
        if(url){
            let match = url.match(ETCD_MATCH);
            if(match)
                u = match[1];
        }
        this._etcd = Etcd(u);
    }

    async get(key, recursive = true){
        return new Promise((resolve, reject)=>{
            this._etcd.get(key, { recursive: recursive }, (err, body)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(body);
                }
            });
        });
    }

    async getjson(key){
        return new Promise((resolve, reject)=>{
            this._etcd.get(key, { recursive: false }, (err, body)=>{
                if(err){
                    reject(err);
                }else{
                    let jval = JSON.parse(body.node.value);
                    resolve(jval);
                }
            });
        });
    }

    async mget(key, json = true, retkey = false){
        let ret = await this.get(key);
        debug(ret);

        if(!ret || !ret.node ||!ret.node.nodes){
            debug('nodes empty');
            return null;
        }

        let keys = [];
        let values = [];
        for(let o of ret.node.nodes){
            if(retkey)
                keys.push(o.key.substr(o.key.lastIndexOf('/')+1));
            let v = json ? JSON.parse(o.value) : o.value;
            if(v){
                values.push(v);
            }
        }

        if(retkey)
            return [values, keys];
        else
            return values;
    }

    async set(key, value, ttl = null){
        return new Promise((resolve, reject)=>{
            let val = value;
            if(tools.isJSON(val)){
                val = JSON.stringify(value, null, 2);
            }

            this._etcd.set(key, val, ttl ? {ttl: ttl} : null, (err, body)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(body);
                }
            });
        });
    }

    async put(key, value, ttl = null){
        return this.set(key, value, ttl);
    }

    async del(key){
        return new Promise((resolve, reject)=>{
            this._etcd.del(key, { recursive: true }, (err, body)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(body);
                }
            });
        });
    }

    watch(key, cb){
        return this._etcd.wait(key, cb);
    }

    raw(){
        return this._etcd;
    }

    /**
     * 设置全局URL
     * @param url
     */
    static set_url(url){
        let match = url.match(ETCD_MATCH);
        if(match)
            _global_etcd = match[1];
    }
}

exports = module.exports = (url)=> new etcd(url);
exports.set_url = (url) => etcd.set_url(url);