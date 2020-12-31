const { Command } = require("../classes.js");

module.exports = class Contact extends Command {
  constructor(client) {
    super(client, {
      name: "contact",
      description: "Create a thread with the specified recipient",
      perm: "mods"
    });
  }
};
