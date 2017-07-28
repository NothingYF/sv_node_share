/**
 * Created by Nothing on 2017/7/14.
 * 信息校验正则表达式
 */

const exp = {
    mobile: /^1[0-9]{10}$/,
    organ: /^[&#\w\u4E00-\u9FA5\uF900-\uFA2D]+(-[&#\w\u4E00-\u9FA5\uF900-\uFA2D]+)*$/,
    email: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
    qq: /^[1-9][0-9]{4,9}$/,
    port: /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-5]{2}[0-3][0-5])$/,
    ip: /^(\d|[1-9]\d|1\d{2}|2[0-5][0-5])\.(\d|[1-9]\d|1\d{2}|2[0-5][0-5])\.(\d|[1-9]\d|1\d{2}|2[0-5][0-5])\.(\d|[1-9]\d|1\d{2}|2[0-5][0-5])$/
}

exports.isMobile = function (mobile) {
    return exp.mobile.test(mobile);
}

exports.isOrgan = function (organ) {
    return exp.organ.test(organ);
}

exports.isQQ = function (qq) {
    return exp.qq.test(qq);
}

exports.isEmail = function (email) {
    return exp.email.test(email);
}

exports.isIP = function (ip) {
    return exp.ip.test(ip);
}

exports.isPort = function (port) {
    return exp.port.test(port);
}