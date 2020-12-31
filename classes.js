const { Client, Collection } = require("discord.js");

class ModMailClient extends Client {
  constructor(...opt) {
    super(...opt);

    this.config = require("./config.js");

    this.data = require("./data.js");

    this.models = require("./database.js");
    
    this.commands = new Collection();
  }
}

class Event {
  constructor(client, { name, emitter }) {
    this.client = client;

    this.name = name;

    this.emitter = emitter;
  }
}

class Command {
  constructor(client, { name = "", description = "", aliases = [], perm = "users" }) {
    this.client = client;

    this.name = name;

    this.description = description;

    this.aliases = aliases;
    
    this.perm = perm;
  }
}

module.exports = {
  Command,
  ModMailClient,
  Event
};
