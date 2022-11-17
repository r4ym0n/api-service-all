const AWS = require("aws-sdk");
const debug = require("debug")("server:tmpfile:s3");
// const MdbUtils = require("./mdb_util");

const conn = require("../../utils/dbc")("tmpfile");
const config = require("../../utils/config");

const HttpException = require("../../utils/errors/HttpException");

const s3 = new AWS.S3({
  accessKeyId: config.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_S3_SECRET_ACCESS_KEY,
  endpoint: config.AWS_S3_ENDPOINT,
});

async function uploadFile(originalFilename, fileCode, params) {
  return new Promise(async function (resolve, reject) {
    conn
      .model("Tmpfile")({
        name: originalFilename,
        code: fileCode,
        uploadData: new Date(),
      })
      .save()
      .then(async (result) => {
        console.log("note saved!", result);
        let timer = setTimeout(() => {
          reject(new HttpException("远端上传超时", -10001, 500));
        }, config.S3_UPLOAD_TIMEOUT);
        await s3.upload(params, function (error, data) {
          clearTimeout(timer);
          if (error) {
            reject(error);
          }
          debug("successfully uploaded file");
          resolve(data);
        });
      });
  }).catch((err) => {
    throw err;
  });
}

async function getDownloadStream(fileCode) {
  const params = {
    Bucket: `${config.AWS_S3_BUCKET_NAME}`,
    Key: fileCode,
  };

  const file = await conn.model("Tmpfile").findOne({code: fileCode});
  debug(file)
  let fileName = "";
  if (!file) {
    throw new HttpException("File not found", 10000, 404);
  } 
  try {
    return {
      body: s3.getObject(params).createReadStream(),
      header: `attachment; filename=${encodeURIComponent(file.name)}`,
    };
  } catch (e) {
    throw new HttpException("s3 remote error", -10002, 500);
  }
}

async function getPresigned(ctx) {
  // s3.generate_presigned_url('put_object', Params={"Bucket":BUCKET_NAME, "Key":"path/within/bucket/file.name"}, ExpiresIn=3600)
  const params = {
    Bucket: `${config.AWS_S3_BUCKET_NAME}`,
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
