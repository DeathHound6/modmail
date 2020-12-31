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
    const thread = await message.client.models.threads.findOne({
      channel: message.channel.id
    });
    if (!thread)
      return message.channel.send(
        "This command can only be used in a modmail thread"
      );

    if (thread.mod != message.author.id)
      return message.channel.send("You are not the moderator of this thread");
    if (thread.remind) thread.remind = false;
    else thread.remind = true;
    thread.updated = true;
    await thread.save();

    message.channel.send(
      `Mention reminder has been ${thread.remind ? "Enabled" : "Disabled"}`
    );
  }
};
