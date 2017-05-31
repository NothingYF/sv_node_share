const Redis = require('ioredis');

const init = async(host, port, db = 0) => {

    return new Promise(function (resolve, reject){
        
        const client = new Redis({
            host: host,
            port: port,
            db: db,
        });

        client.on('error', (err) => {
            if (err) {
                reject(err);
            }
        });

        client.on('ready', ()=>{
            resolve(client, null);
        });
    });
}

exports.init = init;
