const mongoose = require("mongoose");

let schema = mongoose.Schema({
  guild: String,
  logs: String,
  supportRole: String,
  category: String
});
module.exports.logs = mongoose.model("log", schema);

schema = mongoose.Schema({
  guild: String,
  recipient: String,
  remind: Array,
  messages: Array,
  open: Boolean,
  channel: String
});
module.exports.threads = mongoose.model("thread", schema);