const { Command } = require("../classes.js");

module.exports = class Remind extends Command {
  constructor(client) {
    super(client, {
      name: "remind",
      description:
        "Whether you should be mentioned upon a new thread message or not",
      perm: "mods"
    });
  }
  async run(message, args) {
    message.delete();
    const log = await message.client.models.logs.findOne({
      guild: message.guild.id
    });
    const thread = await message.client.models.threads.findOne({
      guild: message.guild.id,
      channel: message.channel.id,
      open: true
    });
    if (!thread)
      return message.channel.send(
        "This command can only be used in a modmail thread"
      );

    if (!message.member.roles.cache.has(log.supportRole))
      return message.channel.send(
        "You must be a moderator to use this command"
      );

    if (thread.remind.includes(message.author.id))
      thread.remind.splice(
        thread.remind.findIndex(e => e == message.author.id),
        1
      );
    else thread.remind.push(message.author.id);
    thread.updated = true;
    await thread.save();

    message.channel
      .send(
        `Mention reminder has been ${
          thread.remind.includes(message.author.id) ? "Enabled" : "Disabled"
        }`
      )
      .then(m => m.delete({ timeout: 4000 }));
  }
};
