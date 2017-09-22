'use strict';

const system = require('../index').system();
const logger = require('../index').logger('system');

const example = async ()=>{
    try{

        logger.debug(system.platform());

        system.on('metric', (body)=>{
            logger.debug(body);
        });

    }catch(e){
        logger.error(e);
    }
};

example();

