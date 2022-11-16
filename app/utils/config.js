require('dotenv').config()


const MONGODB_URI = process.env.MONGODB_URI? process.env.MONGODB_URI: "mongodb://root:example@127.0.0.1:27017";



module.exports = {
    MONGODB_URI
}