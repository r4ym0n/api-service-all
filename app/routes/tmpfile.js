const router = require('koa-router')()
const mime = require('mime-types')
const debug = require('debug')('server:routes:tmpfile')


const {uploadFile,getPresigned,test, downloadFile} = require("../modules/tmpfile/s3");

router.prefix('/tmpfile')

router.post('/upload', uploadFile);
router.post('/upload2',test);

router.get('/presigned', getPresigned);

router.get('/download/:fcode', downloadFile);
router.get('/download', downloadFile);

router.get('/', async function (ctx, next) {
    let url = ctx.url
    ctx.body = router.stack.map(i => i.path)
})

module.exports = router
