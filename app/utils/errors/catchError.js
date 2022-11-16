const debug = require("debug")("server:errors:catchError");

const  HttpException  = require("./HttpException");

// 
const catchError = async (ctx, next) => {
  try {
    await next();
  } catch (error) {

    console.log(error);
    // check if is known HttpException
    if (error instanceof HttpException) {
      let errInfo = {
        error: error.msg,
        code: error.code,
        errorCode: error.errorCode
      }
      ctx.status = error.code;
      return (ctx.body = errInfo);
    } else {
      // is not , throw exception
      throw error;
    }
  }
};

module.exports = catchError;
