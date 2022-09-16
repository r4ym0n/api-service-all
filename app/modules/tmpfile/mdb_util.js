const debug = require('debug')('server:tmpfile:MdbUtils')

const MongoDB = require('../common/mongodb');

class MdbUtils extends MongoDB {    

    async deleteItemByKey(key) {
        let dbConnection = await this.getDBConnection()
        return await dbConnection.collection(this.collection).deleteOne(key);
    }

    async getFileNameByCode(code) {
        debug("Query: " + JSON.stringify({code: code}))
        return await this.findItemByKey({code: code})
    }

    async setFileCodebyName(name, code) {
        debug("insertOne: " + JSON.stringify({name: name, code: code}))
        return await this.insertOne({name: name, code: code, uploadDate: new Date()})
    };
}


module.exports = MdbUtils;