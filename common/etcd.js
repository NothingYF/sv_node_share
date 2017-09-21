/**
 * Created by Nothing on 2017/6/7.
 */

const debug = require('debug')('etcd');
const tools = require('./tools');
const request = require('./request');
const urlencode = require('urlencode');

const ETCD_MATCH = /(http:\/\/.+:\d+)/i;
const ETCD_V2_KEYS ='/v2/keys';

//var _global_etcd = '127.0.0.1:2379';
var _etcd = 'http://127.0.0.1:2379/v2/keys';


/**
 * ETCD Promise封装类
 */
class etcd{

    /**
     * 构造函数
     * @param url ETCD路径，
     */
    constructor(url = null){
        if(url)
            etcd.set_url(url);
    }

    async get(key, opt = null){
        let url = _etcd + key;

        if(opt && opt.recursive)
            url += '?recursive=true';

        let ret = await request.call(url);

        if(ret)
            debug(ret.body);

        let body = ret.body;

        if(opt && opt.json){
            if(body && body.node && body.node.value){
                return JSON.parse(body.node.value);
            }else{
                return null;
            }
        }else{
            return body;
        }
    }

    async getjson(key){
        return await this.get(key, {json: true});
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

        let val = value;
        if(tools.isJSON(val)){
            val = urlencode(JSON.stringify(value, null, 2));
        }

        let url = _etcd + key;
        let body = 'value=' + val + (ttl ? '&ttl=' + ttl : '');

        debug(url, body);

        var o = {
            method : 'PUT',
            url : url,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'},
            body: body
        };

        let ret = await request.call(o);
        if(ret)
            return ret.body;

        return ret;
    }

    async put(key, value, ttl = null){
        return this.set(key, value, ttl);
    }

    async del(key, dir = false, recursive = true){
        let url = _etcd + key + '?dir=' + dir + '&recursive=' + recursive;

        debug(url);

        var o = {
            method : 'DELETE',
            url : url
        };

        let ret = await request.call(o);
        if(ret)
            return ret.body;

        return ret;
    }

    watch(key, cb){
        let url = _etcd + key + '?wait=true';
        let self = this;
        request.call({url: url, timeout: 60000})
            .then(ret => {
                cb(null, ret.body);
                process.nextTick(self.watch.bind(self, key, cb));
            })
            .catch(err => {
                debug(err);
                if(err.code == 'ESOCKETTIMEDOUT') {
                    process.nextTick(self.watch.bind(self, key, cb));
                }else{
                    setTimeout(()=>{
                        self.watch(key, cb);
                    }, 20000);
                }
            });
    }


    /**
     * 设置全局URL
     * @param url
     */
    static set_url(url){
        if(url){
            let match = url.match(ETCD_MATCH);
            if(match)
                _etcd = match[0] + ETCD_V2_KEYS;
        }
    }
}

exports = module.exports = (url)=> new etcd(url);
exports.set_url = (url) => etcd.set_url(url);