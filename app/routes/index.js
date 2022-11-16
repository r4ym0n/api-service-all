const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const mime = require('mime-types')
const debug = require('debug')('server:routes:index')
const HttpException = require("../utils/errors/HttpException");

// router.get('/string', async (ctx, next) => {
//   ctx.body = 'koa2 string'
// })

// router.get('/json', async (ctx, next) => {
//   ctx.body = {
//     title: 'koa2 json'
//   }
// })

router.get('/', async function (ctx, next) {
  let url = ctx.url
  ctx.wpbody = "not implemented";
})

router.get('/error', async function (ctx, next) {
  throw new HttpException("非法请求参数", 10001, 400);

})

module.exports = router
