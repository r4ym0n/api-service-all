const mongoose = require('mongoose');
const config = require('./config')

const Note = require('../models/notes')
const Tmpfile = require('../models/tmpfile')
module.exports = function connectionFactory(dbName) {
    const conn = mongoose.createConnection(config.MONGODB_URI, {dbName: dbName});
    conn.on('error', console.error.bind(console, '连接数据库失败'));

    switch (dbName) {
    case 'test':
        conn.model('User', require('../models/user'));
        conn.model('PageView', require('../models/pageView'));
        break;
    case 'tmpfile':
        conn.model(Note.name, Note.model);
        conn.model(Tmpfile.name, Tmpfile.model);

        break;
}

  return conn; 
};