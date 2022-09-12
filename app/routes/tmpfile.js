const router = require('koa-router')()
const mime = require('mime-types')
const debug = require('debug')('server:routes:tmpfile')

router.prefix('/tmpfile')


router.get('/', async function (ctx, next) {
  let url = ctx.url
  ctx.body = "tmpfile test";
})

// upload file to server
router.post('/upload', async function (ctx, next) {
    let url = ctx.url
    ctx.body = "tmpfile test";
})


module.exports = router
