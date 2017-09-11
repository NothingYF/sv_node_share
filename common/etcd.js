/**
 * Created by Nothing on 2017/6/7.
 */

const debug = require('debug')('etcd');
const tools = require('./tools');
const Etcd = require('node-etcd');

/**
 * ETCD Promise封装类
 */
class etcd{
    constructor(url = null){
        this._etcd = new Etcd(url);
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
            return [keys, values];
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

    watcher(key){
        return this._etcd.watcher(key);
    }

    raw(){
        return this._etcd;
    }
}


exports = module.exports = etcd;