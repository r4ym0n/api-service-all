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

async function downloadArchive(ctx) {
  const fileNames = ["file1.JPG", "file2.pdf", "file3.txt"];

  const zipFileName = "myfiles.zip";
  const zipFile = fs.createWriteStream(`./${zipFileName}`);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  archive
    .on("warning", (err) => {
      if (err.code === "ENOENT") {
        // log warning
        console.log(`File does not exist.`, err);
      } else {
        throw err;
      }
    })
    .on("error", (err) => {
      throw err;
    })
    .pipe(zipFile);

  zipFile.on("close", () => {
    console.log(archive.pointer(), "total bytes" + zipFile.path);
    zipFile.end();
    console.log("zip files created successfully.");
  });

  fileNames.forEach((file) => {
    const params = {
      Bucket: `${AWS_S3_BUCKET_NAME}`,
      Key: file,
    };
    const s3Stream = s3.getObject(params).createReadStream();
    archive.append(s3Stream, { name: file });
  });

  await archive.finalize();
  ctx.response.set(
    "Content-disposition",
    `attachment; filename=${encodeURIComponent(zipFileName)}` // fileName in ZH
  );
  ctx.body = fs.createReadStream(zipFile.path);
  fs.unlinkSync(zipFile.path);
}

async function getDownloadStream(fileCode) {
  const params = {
    Bucket: `${AWS_S3_BUCKET_NAME}`,
    Key: fileCode,
  };

  const files = await mdbUtils.getFileNameByCode(fileCode);

  if (files.length == 0) {
    throw new HttpException("文件不存在", 10000, 404);
  } else {
    const fileName = files[0].name;
    debug("Get File name: " + fileName);
    ctx.response.set(
      "Content-disposition",
      `attachment; filename=${encodeURIComponent(fileName)}`
    );
  }

  try {
    return s3.getObject(params).createReadStream();
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
