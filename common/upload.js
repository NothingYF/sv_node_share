/**
 * Created by Administrator on 2018/4/16.
 */
const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');

/**
 * 文件上传
 * @param {Object} req koa-request对象
 * @param {Object} uploadPath 上传路径
 * @param {Object} limist 上传选项
 */
const parse = (req, uploadPath, limit = {}) => {
    // 上传文件大小限制(Byte)
    limit.fileSize = limit.fileSize || "102400";
    // 上传文件数量限制
    limit.files = limit.files || "10";
    // 数据块+field限制
    limit.parts = limit.parts || "20";

    const busboy = new Busboy({
        limits: limits,
        headers: req.headers
    });

    return new Promise((resolve, reject) => {
        let files = [];
        let fileds = {};
        let hasError = null;
        let dir = uploadPath;

        busboy.on('file', (fieldName, stream, filename, encoding, mimeType) => {
            if (!filename) {
                return reject('fileNameEmpty');
            }

            const file = path.join(dir, filename);
            const ws = fs.createWriteStream(file);
            ws.on('error', (e)=>{
                reject(e);
            });

            stream.pipe(ws);

            stream.on('end', () => {
                files.push({fileName: filename, tmpPath: file});
            });
            stream.on('limit', () => hasError = 'filesSizeLimit');
        });
        busboy.on('field', (fieldName, val) => {
            if (fieldName === 'type'){
                dir = path.join(uploadPath, val.toLowerCase());
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
            }
        });
        busboy.on('partsLimit', () => hasError = 'partsLimit');
        busboy.on('filesLimit', () => hasError = 'filesNumberLimit');
        busboy.on('fieldsLimit', () => hasError = 'fieldsLimit');
        busboy.on('finish', () => {
            if (hasError) {
                reject(hasError);
            }
            else {
                resolve({
                    files: files,
                    fields: fileds,
                });
            }
        });

        req.pipe(busboy);
    });
}

module.exports = {
  parse
};