const fs = require("fs");
const AWS = require('aws-sdk');
const archiver = require('archiver');
const debug = require('debug')('server:tmpfile:s3')
const MdbUtils = require('./mdb_util')
const  HttpException  = require("../errors/HttpException");


const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_S3_ENDPOINT,
})

const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const mdbUtils = new MdbUtils('tmpfile', 'data')

async function uploadFile(ctx) { 
    //myFile is the attribute/input name in your frontend app "Form-Data" 
    const files = ctx.request.files.myFile; 

    //to handle single file and multiple files
    const myFiles = Array.isArray(files) ? files : typeof files === "object" ? [files] : null; 
    let fileCode = "";
    
    if (myFiles) {
        try {
            const filePromises = myFiles.map(file => {
                let { filepath, originalFilename,newFilename, mimetype } = file;
                const body = fs.createReadStream(filepath);
                fileCode = newFilename.slice(0,8);
                const params = {
                    Bucket: `${AWS_S3_BUCKET_NAME}`,
                    Key:  fileCode + '|' + originalFilename,
                    Body: body,
                    ContentType: mimetype,
                };
                return new Promise(function (resolve, reject) {
                    s3.upload(params, function (error, data) {
                        if (error) {
                            reject(error);
                            return;
                        }
                        debug(data);
                        resolve(data);
                        return;
                    });
                });
            });

            let data = await Promise.all(filePromises);
            data = data.map(file => {
                file.fileCode = file.Key.split('|')[0];
                return file;
            });

            let results = {
                data,
            }
            console.log(results);
            ctx.wpbody = results;

        } catch (error) {
            throw new HttpException('远端上传错误',-10000,500)
        }
    }
}


async function downloadArchive(ctx) {
    const fileNames = ["file1.JPG", "file2.pdf", "file3.txt"];

    const zipFileName = "myfiles.zip";
    const zipFile = fs.createWriteStream(`./${zipFileName}`);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    archive.on("warning", (err) => {
        if (err.code === 'ENOENT') {
            // log warning
            console.log(`File does not exist.`, err);
        } else {
            throw err;
        }
    }).on("error", (err) => {
        throw err;
    }).pipe(zipFile);


    zipFile.on("close", () => {
        console.log(archive.pointer(), "total bytes" + zipFile.path);
        zipFile.end();
        console.log("zip files created successfully.");
    });

    fileNames.forEach(file => {
        const params = {
            Bucket: `${AWS_S3_BUCKET_NAME}`,
            Key: file
        };
        const s3Stream = s3.getObject(params).createReadStream();
        archive.append(s3Stream, { name: file });
    });

    await archive.finalize();
    ctx.response.set('Content-disposition', `attachment; filename=${zipFileName}`);
    ctx.body = fs.createReadStream(zipFile.path);
    fs.unlinkSync(zipFile.path);
}



async function test(ctx) {
    mdbUtils.setFileCodebyName("123123", "123123");
    let fileName = await mdbUtils.getFileNameByCode("123123");

    // if(true){
    //     const error = new HttpException('登录错误',10000,500)
    //     throw error
    // }
    // ctx.body = fileName;

    ctx.wpbody = fileName;
}

module.exports = {
    uploadFile,
    downloadArchive,
    test,
}