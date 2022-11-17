const mongoose = require("mongoose");

module.exports = {
  name: "Note",
  model: new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
  }),
};
