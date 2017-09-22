/**
 * metric
 * 操作系统性能指标
 */
"use strict";

const os = require('os');
const EventEmitter = require('events').EventEmitter;
const ostb = require('os-toolbox');
const debug = require('debug')('system');
const util = require('util');
const mp = util.promisify(require('metrics-process'));

const GBytes = 1 << 30;
const MBytes = 1 << 20;
const KBytes = 1 << 10;

/**
 * 操作系统性能指标
 */
class system extends EventEmitter{
    /**
     * 构造函数
     * @param interval 间隔时间(毫秒)
     */
    constructor(interval = 60000){
        super();
        this.interval = interval;
        this.metric();
        setInterval(()=> this.metric(), interval);
    }

    async metric(){
        let top = await ostb.currentProcesses({type: 'cpu', order: 'desc'});
        let body = {
            cpu :  await ostb.cpuLoad(),
            memory: await ostb.memoryUsage() + '%',
            top: top.splice(0, 5),
            process: await mp()
        };

        this.emit('metric', body);
    }

    platform(){
        let osinfo = `${os.type()} ${os.release()} ${os.arch()}`;
        let cpus = os.cpus();
        let cpuinfo = `${cpus[0].model} ${cpus.length} cores`;
        let mem = `${system.bconv(os.freemem())} / ${system.bconv(os.totalmem())}`;
        let interfaces = os.networkInterfaces();
        let network = {};
        for(let o in interfaces){
            //network += o + interfaces[o].address + '\n';
            network[o] = [];
            for(let v of interfaces[o]){
                network[o].push(v.address);
            }
        }

        let uptime = os.uptime();
        let uptimeinfo = uptime > 86400 ? ((uptime / 86400).toFixed(0) + ' days') : ((uptime / 3600).toFixed(0) + ' hours');

        let body = {
            CPU: cpuinfo,
            OS: osinfo,
            Memory: mem,
            Network: network,
            Uptime: uptimeinfo
        };
        return body;
    }

    static bconv(num){
        if(num > GBytes){
            return (num/GBytes).toFixed(1) + ' GB';
        }
        if(num > MBytes){
            return (num/MBytes).toFixed(1) + ' MB';
        }
        if(num > KBytes){
            return (num/KBytes).toFixed(1) + ' KB';
        }
        return num + 'Bytes';
    }
}

const wrapper = function(interval = 60000){
    return new system(interval);
}

module.exports = wrapper;