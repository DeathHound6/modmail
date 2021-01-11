const hastebin = require("hastebin-gen");
const { MessageEmbed } = require("discord.js");
const { Command } = require("../classes.js");

module.exports = class Close extends Command {
  constructor(client) {
    super(client, {
      name: "close",
      description: "Close a ModMail thread",
      aliases: ["delete", "del"],
      perm: "mods",
      usage: ""
    });
  }
  async run(message, args) {
    const log = await message.client.models.logs.findOne({
      guild: message.guild.id
    });
    if (!log)
      return message.reply(
        "The server has not been setup. Please run the `setup` command"
      );

    const thread = await message.client.models.threads.findOne({
      channel: message.channel.id,
      open: true
    });
    if (thread) {
      thread.open = false;
      thread.updated = true;
      await thread.save();

      let embed = new MessageEmbed()
        .setTitle("Thread Closed")
        .setColor(message.client.data.colours.red)
        .setTimestamp()
        .setDescription(
          "Your ModMail Thread has been closed. If you need any more help, please send another message"
        )
        .setFooter(
          "SYSTEM",
          message.client.user.displayAvatarURL({ dynamic: true })
        );

      const user = await message.client.users
        .fetch(thread.recipient)
        .catch(console.log);
      if (user) user.send(embed).catch(console.log);

      await message.channel.delete("ModMail Thread Closed");
      let text = "";
      for (let msg of thread.messages) {
        let links = await msg.attachments
          .map(attach => `${attach.url}`)
          .join("\n");

        const author = message.client.users.cache.get(msg.author);
        text += `${
          author.id == thread.recipient ? "__RECIPIENT__" : "__MODERATOR__"
        } **${author.username}** => ${msg.content ? msg.content : ""} ${
          links.length ? `\nImages: ${links}` : ""
        }\n\n`;
        links = "";
      }
      const haste = await hastebin(text, { extension: "txt" });

      if (!user) return;
      embed = new MessageEmbed()
        .setTitle(`Logs for ${user.tag}`)
        .setColor(message.client.data.colours.purple)
        .setDescription(`The [logs](${haste})`)
        .addField("Recipient", `${user.tag} (${user.id})`)
        .addField("Message Count", `${thread.messages.length} messages`)
        .setTimestamp();
      const channel = message.client.channels.cache.get(log.logs);
      if (channel) channel.send(embed);
    } else {
      message.reply("This command can only be used in a ModMail thread");
    }
  }
};
