const { Command } = require("../classes.js");
const { MessageEmbed } = require("discord.js");

module.exports = class Help extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      description: "Shows this message",
      usage: "{command(name or alias)}"
    });
  }
  async run(message, args) {
    const client = message.client;

    let embed;
    if (args[0]) {
      const cmd = client.commands.find(
        e => e.name == args[0] || e.aliases.includes(args[0])
      );
      if (!cmd) {
        embed = new MessageEmbed()
          .setTitle("No Command")
          .setColor(client.data.colours.red)
          .setDescription(`No command, ${args[0]}, was found`)
          .setTimestamp();
        return message.reply({ embed });
      }
      if (message.member.permissions.has(cmd.perm)) {
        embed = new MessageEmbed()
          .setTitle(cmd.name)
          .setColor(client.data.colours.blue)
          .addField("Description", cmd.description)
          .addField("Aliases", cmd.aliases.join(", ") || "No Aliases")
          .addField("Usage", `${client.config.prefix}${cmd.name} ${cmd.usage}`)
          .addField("Minimum Permission", cmd.perm.toProperCase())
          .setFooter(`Usage: [param1] is required, {param2} is optional`)
          .setTimestamp();
        message.channel.send({ embed });
      }
    } else {
      const commands = client.commands
        .filter((value, key) => {
          return message.member.permissions.has(value.perm)
        })
        .map((value, key) => {
          return `:white_check_mark: ${key} - ${value.description}`;
        })
        .join("\n");
      embed = new MessageEmbed()
        .setTitle("Commands")
        .setColor(client.data.colours.blue)
        .setDescription(commands)
        .setTimestamp();
      message.channel.send({ embed });
    }
  }
};
