const debug = require("debug")("server:errors:catchError");

const  HttpException  = require("./HttpException");

const catchError = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    let errInfo = {
      error: error.msg,
      code: error.code,
      errorCode: error.errorCode
    }
    debug(errInfo)
    // check if is known HttpException
    if (error instanceof HttpException) {
      return (ctx.body = errInfo);
    } else {
      // is not , throw exception
      throw error;
    }
  }
};

module.exports = catchError;
