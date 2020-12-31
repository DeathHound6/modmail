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
  owners: Array,
  mods: Array,
  users: Array
});

module.exports.perms = mongoose.model("perm", schema);

schema = mongoose.Schema({
  guild: String,
  recipient: String,
  remind: Boolean,
  messages: Array,
  open: Boolean,
  channel: String
});

module.exports.threads = mongoose.model("thread", schema);