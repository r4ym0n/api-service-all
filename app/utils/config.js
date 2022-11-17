require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://root:example@127.0.0.1:27017";
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const S3_UPLOAD_TIMEOUT = 15000;

const AWS_S3_ACCESS_KEY_ID = process.env.AWS_S3_ACCESS_KEY_ID || "";
const AWS_S3_SECRET_ACCESS_KEY = process.env.AWS_S3_SECRET_ACCESS_KEY || "";

const AWS_S3_ENDPOINT = process.env.AWS_S3_ENDPOINT || "";

module.exports = {
    MONGODB_URI,
    AWS_S3_BUCKET_NAME,
    S3_UPLOAD_TIMEOUT,
    AWS_S3_ACCESS_KEY_ID,
    AWS_S3_SECRET_ACCESS_KEY,
    AWS_S3_ENDPOINT,
}