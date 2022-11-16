const fs = require("fs");
const AWS = require("aws-sdk");
const archiver = require("archiver");
const debug = require("debug")("server:tmpfile:s3");
const MdbUtils = require("./mdb_util");
const HttpException = require("../../utils/errors/HttpException");
const { throws } = require("assert");

const S3_UPLOAD_TIMEOUT = 15000;
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_S3_ENDPOINT,
});

const mdbUtils = new MdbUtils("tmpfile", "data");

async function uploadFile(originalFilename, fileCode, params) {
  
  return new Promise(async function (resolve, reject) {
    await mdbUtils.setFileCodebyName(originalFilename, fileCode);

    let timer = setTimeout(() => {
      reject(new HttpException("远端上传超时", -10001, 500));
    }, S3_UPLOAD_TIMEOUT);

    await s3.upload(params, function (error, data) {
      clearTimeout(timer);
      if (error) {
        reject(error);
      }
      debug("successfully uploaded file");
      resolve(data);
    });
  }).catch((err) => {
    throw err;
  });
}



async function getDownloadStream(fileCode) {
  const params = {
    Bucket: `${AWS_S3_BUCKET_NAME}`,
    Key: fileCode,
  };

  const files = await mdbUtils.getFileNameByCode(fileCode);
  let fileName = "";
  if (files.length == 0) {
    throw new HttpException("文件不存在", 10000, 404);
  } else {
    fileName = files[0].name;
    debug("Get File name: " + fileName);
  }

  try {
    return {
      body: s3.getObject(params).createReadStream(),
      header: `attachment; filename=${encodeURIComponent(fileName)}`
    }
      
  } catch (e) {
    throw new HttpException("s3 remote error", -10002, 500);
  }
}

async function getPresigned(ctx) {
  // s3.generate_presigned_url('put_object', Params={"Bucket":BUCKET_NAME, "Key":"path/within/bucket/file.name"}, ExpiresIn=3600)
  const params = {
    Bucket: `${AWS_S3_BUCKET_NAME}`,
    Key: "1221312",
    Expires: 3600,
  };
  return s3.getSignedUrl("putObject", params);
}

module.exports = {
  uploadFile,
  getPresigned,
  getDownloadStream,
};
