const mongoose = require("mongoose");
const req = require("require-all");
const { Event } = require("../classes.js");

module.exports = class Ready extends Event {
  constructor(client) {
    super(client, { name: "ready", emitter: client });
  }
  async run() {
    this.client.user.setPresence({
      activity: {
        name: "for DMs",
        type: "WATCHING"
      }
    });
    console.log(`Bot Online: ${this.client.user.tag}`);

    let cmdFiles = req(`${process.cwd()}/commands/`);
    for (let command of Object.values(cmdFiles)) {
      command = new command(this.client);
      if (!command.name || command.name.length < 1) continue;
      this.client.commands.set(command.name, command);
      console.log(`Loaded command >${command.name}<`);
    }

    mongoose.connect(
      this.client.config.mongo.connectionString,
      this.client.config.mongo.options
    );
    let log = await this.client.models.logs.findOne({});
    if (!log) return;
    let perm = await this.client.models.perms.findOne({});
    if (!perm) return;

    let members = await (await this.client.channels.fetch(
      log.logs
    )).guild.members.fetch();
    members = members.array();
    for (let i = 0; i < members.length; i++) {
      if (members[i].user.bot) continue;
      if (!perm.users.includes(members[i].user.id)) perm.users.push(members[i].user.id);
      if (
        !perm.mods.includes(members[i].user.id) &&
        members[i].roles.cache.has(log.supportRole)
      )
        perm.mods.push(members[i].user.id);
      if (
        !perm.owners.includes(members[i].user.id) &&
        members[i].permissions.has("MANAGE_GUILD")
      )
        perm.owners.push(members[i].user.id);
    }
    perm.updated = true;
    await perm.save();
  }
};
