/**
 * Created by Nothing on 2017/6/7.
 */

const debug = require('debug')('etcd');
const urlencode = require('urlencode');
const request = require('./request');

var etcd_url = 'http://127.0.0.1:2379/v2/keys/';

/**
 * 获取键值
 * @param key
 * @param json
 * @returns {*}
 */
exports.get = async(key, json = true)=>{

    let url = etcd_url + key;

    let ret = await request.call(url);
    debug(ret.body);

    if(ret.body.errorCode)
        return null;

    if(json && ret.body && ret.body.node){
        return JSON.parse(ret.body.node.value);
    }

    return ret;
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