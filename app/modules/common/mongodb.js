// Import Dependencies
const url = require('url')
const MongoClient = require('mongodb').MongoClient
const debug = require('debug')('server:common:mongodb')

// Create cached connection variable
// let cachedDb = null

// ENV will be set by vercal automatically
if (!process.env.MONGO_URL) {
    // local dev-env
    process.env.MONGO_URL = "mongodb://root:example@127.0.0.1:27017/"
}

class MongoDB {
    constructor(dbName,collection) {
        this.collection = collection;
        this.dbName = dbName;
        debug(`set dbName: ${dbName}, collection: ${collection}`);
        this.db = this.getDBConnection()
        this.cachedDb = this.db;
    }

    async connect2DB(dbName) {
        const uri = process.env.MONGO_URL
        try {
            const dbClient = await MongoClient.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });
            const db = await dbClient.db(dbName);
            debug('mdb connection established');
            return db
        } catch (err) {
            debug(err.message)
            return null
        }
    }

    async getDBConnection() {
        if (this.cachedDb) {
            this.db = this.cachedDb
            return this.cachedDb
        } else {
            let dbInstance = await this.connect2DB(this.dbName);
            this.cachedDb = dbInstance;
            return dbInstance;
        }

    }

    async insertOne(data) {
        let dbConnection = await this.getDBConnection()
        return await dbConnection.collection(this.collection).insertOne(data)
    }
    async findItemByKey(key) {
        await this.getDBConnection()
        return await this.db.collection(this.collection).find(key).toArray()
    }

    async deleteItemByKey(key) {
        await this.getDBConnection()
        this.db.collection(this.collection).deleteOne(key);
    }
}
// function factory() {
//     return new MDB
// }

module.exports = MongoDB;