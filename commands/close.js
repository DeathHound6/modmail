const hastebin = require("hastebin-gen");
const { MessageEmbed } = require("discord.js");
const { Command } = require("../classes.js");

module.exports = class Close extends Command {
  constructor(client) {
    super(client, {
      name: "close",
      description: "Close a ModMail thread",
      aliases: ["delete", "del"],
      perm: "mods"
    });
  }
  async run(message, args) {
    let log = await message.client.models.logs.findOne({});
    if (!log)
      return message.reply(
        "The server has not been setup. Please run the `setup` command"
      );
    let thread = await message.client.models.threads.findOne({
      channel: message.channel.id
    });
    if (thread) {
      thread.open = false;
      thread.updated = true;
      await thread.save();

      let embed = new MessageEmbed()
        .setTitle("Thread Closed")
        .setColor(message.client.data.colours.red)
        .setDescription(
          "Your ModMail Thread has been closed. If you need any more help, please send another message"
        )
        .setFooter(
          "SYSTEM",
          message.client.user.displayAvatarURL({ dynamic: true })
        );

      await (await message.client.users.fetch(thread.recipient))
        .send(embed)
        .catch(() => {});

      await message.channel.delete("ModMail Thread Closed");
      let text = "";
      for (let msg of thread.messages) {
        let links = await msg.attachments
          .map(attach => `${attach.url}`)
          .join("\n");

        let author = await message.client.users.fetch(msg.author);
        text += `${
          author.id == thread.recipient ? "__RECIPIENT__" : "__MODERATOR__"
        } **${author.username}** => ${msg.content ? msg.content : ""} ${
          links.length ? `\nImages: ${links}` : ""
        }\n\n`;
        links = "";
      }
      const haste = await hastebin(text, { extension: "txt" });

      embed = new MessageEmbed()
        .setTitle(
          `Logs for ${(await message.client.users.fetch(thread.recipient)).tag}`
        )
        .setColor(message.client.data.colours.purple)
        .setDescription(`The [logs](${haste})`)
        .addField(
          "Recipient",
          `${(await message.client.users.fetch(thread.recipient)).tag} (${
            thread.recipient
          })`
        )
        .addField(
          "Moderator",
          `${(await message.client.users.fetch(thread.mod)).tag} (${
            thread.mod
          })`
        )
        .addField("Message Count", `${thread.messages.length} messages`)
        .setTimestamp();
      (await message.client.channels.fetch(log.logs)).send(embed);
    } else {
      message.reply("This command can only be used in a ModMail thread");
    }
  }
};
