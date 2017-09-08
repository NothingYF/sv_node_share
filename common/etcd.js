/**
 * Created by Nothing on 2017/6/7.
 */

const debug = require('debug')('etcd');
const urlencode = require('urlencode');
const request = require('./request');

var etcd_url = 'http://127.0.0.1:2379/v2/keys';

/**
 * 获取节点键值
 * @param key
 * @param json
 * @returns {*}
 */
exports.get = async(key, recursive = true)=>{

    let url = etcd_url + key;

    if(recursive)
        url += '?recursive=true';

    debug(url);

    let ret = await request.call(url);

    if(ret)
        debug(ret.body);

    return ret.body;
}

/**
 * 获取节点列表并转为JSON数组（非递归）
 * @param key
 * @param retkey 是否返回keys
 * @returns {Promise.<void>}
 */
exports.mget = async(key, retkey = false)=>{

    let url = etcd_url + key;

    debug(url);

    let ret = await request.call(url);

    debug(ret.body);

    if(!ret || !ret.body || !ret.body.node){
        debug('empty');
        return null;
    }

    let nodes = ret.body.node.nodes;
    if(!nodes){
        debug('nodes empty');
        return null;
    }

    debug(nodes);

    let keys = [];
    let values = [];
    for(let o of nodes){
        if(retkey)
            keys.push(o.key.substr(o.key.lastIndexOf('/')+1));
        let jobj = JSON.parse(o.value);
        if(jobj){
            values.push(jobj);
        }
    }

    if(retkey)
        return [keys, values];
    else
        return values;
}

/**
 * 写入键值
 * @param key
 * @param value
 * @param ttl
 * @param json
 * @returns {*}
 */
exports.put = async(key, value, ttl = null, dir = false, json = true)=>{

    let url = etcd_url + key;
    let body = 'value=' + urlencode(json ? JSON.stringify(value) : value) +
        (ttl ? '&ttl=' + ttl : '') + (dir ? '&dir=' + dir : '');

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


/**
 * 删除键值
 * @param key
 * @param json
 * @returns {*}
 */
exports.del = async(key, dir = false, recursive = true)=>{

    let url = etcd_url + key + '?dir=' + dir + '&recursive=' + recursive;

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

/**
 * 设置全局etcd路径
 * @param url
 */
exports.set_url = (url) =>{
    etcd_url = url;
}

/**
 * 获取全局etcd路径
 * @returns {string}
 */
exports.get_url = ()=>{
    return etcd_url;
}
