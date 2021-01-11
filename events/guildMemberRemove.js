const { Event } = require("../classes.js");
const { MessageEmbed } = require("discord.js");
const hastebin = require("hastebin-gen");

module.exports = class GuildMemberRemove extends Event {
  constructor(client) {
    super(client, { name: "guildMemberRemove", emitter: client });
  }
  async run(member) {
    const thread = await member.client.models.threads.findOne({
      recipient: member.user.id,
      guild: member.guild.id
    });
    if (!thread) return;
    const log = await member.client.models.logs.findOne({
      guild: member.guild.id
    });
    member.guild.channels.cache
      .get(thread.channel)
      .delete("User left the guild");
    thread.open = false;
    thread.updated = true;
    await thread.save();
    if (!log) return;

    let text = "";
    for (let msg of thread.messages) {
      let links = await msg.attachments
        .map(attach => `${attach.url}`)
        .join("\n");

      let author = member.client.users.cache.get(msg.author);
      text += `${
        author.id == thread.recipient ? "__RECIPIENT__" : "__MODERATOR__"
      } **${author.username}** => ${msg.content ? msg.content : ""} ${
        links.length ? `\nImages: ${links}` : ""
      }\n\n`;
      links = "";
    }
    const haste = await hastebin(text, { extension: "txt" });

    const embed = new MessageEmbed()
      .setTitle(
        `Logs for ${(await member.client.users.fetch(thread.recipient)).tag}`
      )
      .setColor(member.client.data.colours.purple)
      .setDescription(`The [logs](${haste})`)
      .addField(
        "Recipient",
        `${(await member.client.users.fetch(thread.recipient)).tag} (${
          thread.recipient
        })`
      )
      .addField("Message Count", `${thread.messages.length} messages`)
      .setTimestamp();
    const channel = member.guild.channels.cache.get(log.logs);
    if (channel) channel.send(embed);
  }
};
