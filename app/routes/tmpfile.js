const router = require('koa-router')()
const mime = require('mime-types')
const debug = require('debug')('server:routes:tmpfile')


const {uploadFile,downloadArchive,test} = require("../modules/tmpfile/s3");

router.prefix('/tmpfile')

router.post('/upload', uploadFile);
router.post('/upload2',test);

router.get('/download', downloadArchive);


router.get('/', async function (ctx, next) {
    let url = ctx.url
    ctx.body = "tmpfile test";
})
  

module.exports = router
