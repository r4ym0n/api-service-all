// Import Dependencies
const url = require("url");
const MongoClient = require("mongodb").MongoClient;
const debug = require("debug")("server:common:mongodb");
const HttpException = require("./errors/HttpException");

const config = require('./config')

// Create cached connection variable
// let cachedDb = null
// ENV will be set by vercal automatically


class MongoDB {
  constructor(dbName, collection) {
    this.collection = collection;
    this.dbName = dbName;
    debug(`set dbName: ${dbName}, collection: ${collection}`);
    this.uri = config.MONGODB_URI;
    this.cachedDb = null;
    // this.getDBConnection();
    
  }

  async connect2DB(dbName) {
    debug("Try to connect to MongoDB...");

    const config = {  connectTimeoutMS: 5000 }
    try {
      const dbClient = await MongoClient.connect(this.uri, config);
      const db = await dbClient.db(dbName);
      debug("MongoDB connection established");
      return db;
    } catch (err) {
      this.cachedDb = null;
      debug(err.message);
      throw new HttpException("数据库连接异常", -10003, 500);
    }
  }

  async getDBConnection() {
    if (this.cachedDb) {
      debug("cached connection")
      this.db = this.cachedDb;
      return this.cachedDb;
    } else {
      debug("no DB connection")
      let dbInstance = await this.connect2DB(this.dbName);
      this.cachedDb = dbInstance;
      return dbInstance;
    }
  }

  async insertOne(data) {
    let dbConnection = await this.getDBConnection();
    return await dbConnection.collection(this.collection).insertOne(data);
  }
  async findItemByKey(key) {
    let dbConnection =  await this.getDBConnection();
    return await dbConnection.collection(this.collection).find(key).toArray();
  }

  async deleteItemByKey(key) {
    let dbConnection =  await this.getDBConnection();
    dbConnection.collection(this.collection).deleteOne(key);
  }
}
// function factory() {
//     return new MDB
// }

module.exports = MongoDB;
