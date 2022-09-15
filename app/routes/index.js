const router = require('koa-router')()
const bodyParser = require('koa-bodyparser')
const mime = require('mime-types')
const debug = require('debug')('server:routes:index')

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

module.exports = router
