const router = require('koa-router')()
const mime = require('mime-types')
const debug = require('debug')('server:routes:tmpfile')
const HttpException = require("../utils/errors/HttpException");


const {uploadFile,getPresigned,test, downloadFile} = require("../modules/tmpfile/s3");

router.prefix('/tmpfile')

router.post('/upload', async (ctx) => {
    const MAX_FILE_SIZE = 20 * 1024 * 1024;

    //myFile is the attribute/input name in your frontend app "Form-Data"
    const files = ctx.request.files.myFile;
    if (files == undefined) {
        throw new HttpException("invaild request format", 10001, 400);
    }
    if (files.size > MAX_FILE_SIZE) {
        throw new HttpException(
          "File too large: " + files.size + " bytes",
          10003,
          400
        );
    }
    const myFiles = Array.isArray(files)? files: typeof files === "object"? [files]: null;
    let fileCode = "";
    if (myFiles) {
      try {
        const filePromises = myFiles.map((file) => {
          let { filepath, originalFilename, newFilename, mimetype } = file;
          debug("receive file",filepath, originalFilename, newFilename, mimetype)

          fileCode = newFilename.slice(0, 8);
          const params = {
            Bucket: `${AWS_S3_BUCKET_NAME}`,
            Key: fileCode,
            Body: fs.createReadStream(filepath),
            ContentType: mimetype,
          };
          return uploadFile(originalFilename, fileCode, params)
        });
  
        let data = await Promise.all(filePromises);
        data = data.map((file) => {
          file.fileCode = file.Key;
          return file;
        });
        ctx.wpbody = data;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
});

router.get('/presigned', async (ctx)=> {
    try {
        ctx.wpbody = await getPresigned();
    } catch (e) {
        throw new HttpException("remote server error:" + e.message, -10005)
    }
});

router.get('/download/:fcode', async (ctx) => {
    const fileCode = ctx.params.fcode;
    if (fileCode === undefined) {
        throw new HttpException("missing parameter", 10001, 400);
    }
    await downloadFile(ctx);

});

router.get('/', async function (ctx, next) {
    let url = ctx.url
    ctx.body = router.stack.map(i => i.path)
})

module.exports = router
