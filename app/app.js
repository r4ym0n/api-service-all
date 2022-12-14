const Koa = require("koa");
const koaBody = require("koa-body");

const app = new Koa();
// const views = require('koa-views')
const json = require("koa-json");
const fs = require("fs");

const onerror = require("koa-onerror");
const logger = require("koa-logger");
const bodyparser = require("koa-bodyparser");

const index = require("./routes/index");
const tmpfile = require("./routes/tmpfile");

const debug = require("debug")("server:app");

const catchError = require("./utils/errors/catchError");
const successWarpper = require("./utils/errors/successWarpper");

onerror(app, {
  accepts() {
    return "json";
  },
  json(err, ctx) {
    debug(err.code)
    ctx.body = {
      status: err.status || ctx.status,
      msg: err.msg || err.message,
      errorCode: err.errorCode || -1,
      data: ctx.body || "",
    };
    ctx.status = err.status || ctx.status;
  },
});

// middlewares
// app.use(catchError);
app.use(successWarpper);

app.use(json());
app.use(koaBody({ multipart: true }));

app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Methods", "*");
  ctx.set("Access-Control-Allow-Headers", "*");

  if (ctx.method == "OPTIONS") {
    ctx.body = 200;
  } else {
    await next();
  }
});

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  let url = ctx.url;
  debug(`${ctx.method} ${url} - ${ms}ms`);
});

// routes
app.use(tmpfile.routes(), tmpfile.allowedMethods());
app.use(index.routes(), index.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;
