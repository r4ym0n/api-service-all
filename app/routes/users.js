const router = require('koa-router')()

const HttpException = require("../utils/errors/HttpException");

router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})


router.get('/login', function (ctx, next) {
  const { username, password } = ctx.body;
  throw new HttpException("Unauthenticated", -10001, 403);  
})



module.exports = router


client_id: iYCeC9g08h5vuP9UqvPHKKSVrKFXGa1v
client_secret: jXiFMOPVPCWlO2M5CwWQzffpNPaGTRBG
refresh_token: 122.8790a856f420bf4efbfb33b42c711859.Y_t2a8UXYqYDWcV1l082vS08EAbaKY3qNo4KnUO.ctREcQ