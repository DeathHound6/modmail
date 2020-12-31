const { Command } = require("../classes.js");

module.exports = class Help extends Command {
  constructor(client) {
    super(client, { name: "help", description: "Shows this message" });
  }
  async run(message, args) {
    const client = message.client;
    let perm = await client.models.perms.findOne();

    let descrip;
    if (args[0]) {
      let cmd = client.commands.find(
        e => e.name == args[0] || e.aliases.includes(args[0])
      );
      if (!cmd) descrip = "No command found";
      if (perm[cmd.perm].includes(message.author.id))
        descrip = `__${cmd.name}__\nDescription: ${cmd.description}\nAliases: ${
          cmd.aliases.length ? cmd.aliases.join(", ") : "None"
        }`;
    } else {
      descrip = client.commands
        .map((value, key) => {
          return `:white_check_mark: ${key} - ${value.description}`;
        })
        .join("\n");
    }

    message.channel.send(descrip, { split: "\n" });
  }
};
