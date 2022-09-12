require('dotenv').config()

const Koa = require('koa')
const app = new Koa()
// const views = require('koa-views')
const json = require('koa-json')
const fs= require("fs")

const onerror = require('koa-onerror')
const logger = require('koa-logger')
const bodyparser = require('koa-bodyparser')

const index = require('./routes/index')
const tmpfile = require('./routes/tmpfile')

const debug = require('debug')('server:app')
onerror(app)

// middlewares
app.use(json())

app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))

app.use(async (ctx, next)=> {
  ctx.set('Access-Control-Allow-Origin', '*');
  if (ctx.method == 'OPTIONS') {
    ctx.body = 200; 
  } else {
    await next();
  }
});

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  let url = ctx.url
  debug(`${ctx.method} ${url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(tmpfile.routes(), tmpfile.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});


module.exports = app
