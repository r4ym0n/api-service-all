const MongoDB = require('../common/mongodb');

class MdbUtils extends MongoDB {


    async insertOne(data) {
        let dbConnection = await this.getDBConnection()
    
        return await dbConnection.collection(this.collection).insertOne(data)
    }

    async findItemByKey(key) {
        let dbConnection = await this.getDBConnection()
        return await dbConnection.collection(this.collection).find(key).toArray()
    }

    async deleteItemByKey(key) {
        let dbConnection = await this.getDBConnection()
        return await dbConnection.collection(this.collection).deleteOne(key);
    }

    async getFileNameByCode(code) {
        let dbConnection = await this.getDBConnection()
        return await dbConnection.collection(this.collection).find({code: code}).toArray()
    }

    async setFileCodebyName(name, code) {
        await this.insertOne({name: name, code: code})
    };
}


module.exports = MdbUtils;