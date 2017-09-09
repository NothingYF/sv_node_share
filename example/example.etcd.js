'use strict';

const Etcd = require('../index').etcd;
const logger = require('../index').logger('etcd');

const etcd = new Etcd('http://192.168.1.173:8379');

const etcd_example = async ()=>{
    try{

        await etcd.set('/test/123', {hello: 100}, 10);

        let body = await etcd.get('/');
        logger.debug(body.node.nodes);

        let v = await etcd.mget('/platform/server', true, true);
        logger.debug(v);

        let watcher = etcd.watcher('/test/123');

        const logout = logger.debug.bind(logger);
        watcher.on("change", logout);
        // watcher.on("expire", logout);
        // watcher.on("set", logout);
        // watcher.on("delete", logout);
        // watcher.on("error", logout);

    }catch(err){
        logger.error(err);
    }

};

etcd_example();