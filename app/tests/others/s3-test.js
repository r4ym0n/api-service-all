
require('dotenv').config()
// console.log(process.env)

const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    endpoint: process.env.AWS_S3_ENDPOINT,
})

files = s3.listObjectsV2();
console.log(files)