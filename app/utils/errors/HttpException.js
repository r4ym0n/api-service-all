class HttpException extends Error {
    constructor(msg = '服务器异常', errorCode = 1000, status = 500){
        super();
        this.msg = msg;
        this.status = status;
        this.errorCode = errorCode;
    }
}

module.exports = HttpException;