const { Command } = require("../classes.js");
const { MessageEmbed } = require("discord.js");

/*module.exports = */ class Contact extends Command {
  constructor(client) {
    super(client, {
      name: "contact",
      description: "Create a thread with the specified recipient",
      perm: "mods"
    });
  }
  async run(message, args) {
    const client = message.client;
    let embed;

    const log = await client.models.logs.findOne({
      guild: message.guild.id
    });
    if (!log) {
      embed = new MessageEmbed()
        .setTitle("Setup")
        .setDescription(
          "This server is not setup yet. Ask an admin to run the `setup` command"
        )
        .setColor(client.data.colours.red)
        .setTimestamp();
      return message.channel.send({ embed });
    }

    if (!message.member.roles.cache.has(log.supportRole)) {
      embed = new MessageEmbed()
        .setTitle("Support")
        .setColor(client.data.colours.red)
        .setDescription(
          "You must be part of the Support Team to use this command"
        )
        .setTimestamp();
      return message.channel.send({ embed });
    }

    if (!args[0]) {
      embed = new MessageEmbed()
        .setTitle("User")
        .setColor(client.data.colours.red)
        .setDescription("No mention or user ID was given")
        .setTimestamp();
      return message.channel.send({ embed });
    }

    const user =
      message.mentions.users.first() ||
      (await client.users.fetch(args[0]).catch(() => {
        embed = new MessageEmbed()
          .setTitle("User")
          .setColor(client.data.colours.red)
          .setDescription("No mention or an invalid user ID was given")
          .setTimestamp();
        return message.channel.send({ embed });
      }));

    let thread = await client.models.threads.findOne({
      recipient: user.id,
      open: true,
      guild: message.guild.id
    });
    if (thread) {
      embed = new MessageEmbed()
        .setTitle("Thread")
        .setColor(client.data.colours.red)
        .setDescription(`This user has an open thread, <#${thread.channel}>`)
        .setTimestamp();
      return message.channel.send({ embed });
    }
    
    const channel = await message.guild.channels.create(user.username, {
      type: "text",
      topic: `ModMail thread for ${user.tag} (${user.id})`,
      parent: message.guild.channels.cache.get(log.category),
      permissionOverwrites: [
        {
          id: message.guild.roles.everyone.id,
          deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
        },
        {
          id: log.supportRole,
          allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
        }
      ],
      reason: `${message.author.tag} opened a new thread for ${user.tag}`
    });

    thread = await new client.models.threads({
      recipient: user.id,
      open: true,
      messages: [],
      guild: message.guild.id,
      remind: [],
      channel: channel.id
    }).save();
    
    embed = new MessageEmbed()
    .setTitle("Created")
    .setColor(client.data.colours.green)
    .setDescription(`A new thread has been opened, <#${thread.channel}>`)
    
    message.channel.send({ embed });
  }
}
