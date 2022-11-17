const mongoose = require("mongoose");

module.exports = {
  name: "Tmpfile",
  model: new mongoose.Schema({
    name: String,
    code: String,
    uploadDate: Date,
  }),
};
