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

    const cmdFiles = req(`${__dirname}/../commands/`);
    for (let command of Object.values(cmdFiles)) {
      if (typeof command != "function") continue;
      command = new command(this.client);
      if (!command.name || command.name.length < 1) continue;
      this.client.commands.set(command.name, command);
      console.log(`Loaded command >${command.name}<`);
    }

    mongoose.connect(
      this.client.config.mongo.connectionString,
      this.client.config.mongo.options
    );
  }
};
