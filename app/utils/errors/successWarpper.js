const debug = require("debug")("server:errors:wapper");

const successWarpper = async (ctx, next) => {
    await next();

    // console.log(ctx.wpbody);
    if (ctx.wpbody) {
        ctx.body = {
            msg: "success",
            code: 200,
            errorCode: 0,
            data: ctx.wpbody
        }
        debug("wapper wpbody response")
    }
  
};

module.exports = successWarpper;
