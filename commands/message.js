const { Command } = require("../classes.js");

module.exports = class Message extends Command {
  constructor(client) {
    super(client);
  }
  async run(message, args) {
    if (message.channel.type == "text") {
      
    } 
    else if (message.channel.type == "dm") {
      this.dm(message);
    }
  }
  
  async dm(message) {
    if (message.author.bot) return;
    let thread =
      (await message.client.models.threads.findOne({
        recipient: message.author.id,
        open: true
      })) || (await this.createThread(message));
    let log = await message.client.models.logs.findOne({});
    if (log) {
      thread.messages.push({
        content: message.content,
        attachments: message.attachments.array(),
        author: message.author.id
      });
      await (await message.client.channels.fetch(thread.channel))
        .send(
          `__RECIPIENT__ **${message.author.username}** => ${
            message.content ? message.content : ""
          }`,
          message.attachments.array()
        )
        .catch(err => {
          return message.channel.send(
            `An error has occurred. Please try again in a few seconds`
          );
        });
      message.react("✅");
      thread.updated = true;
      await thread.save();
    } else {
      return message.author.send(
        "The guild does not have the ModMail setup yet. Please ask an admin to run the `setup` command"
      );
    }
  }
  
  async createThread(message) {
    let log = await message.client.models.logs.findOne({});
    let channel = await (await message.client.channels.fetch(
      log.logs
    )).guild.channels.create(message.author.username, {
      type: "text",
      topic: `ModMail thread for ${message.author.tag} (${message.author.id})`,
      parent: await message.client.channels.fetch(log.category),
      permissionOverwrites: [
        {
          id: (await message.client.channels.fetch(log.logs)).guild.roles
            .everyone,
          deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
        },
        {
          id: log.supportRole,
          allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
        },
        {
          id: message.author.id,
          deny: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"]
        }
      ],
      reason: `${message.author.tag} opened a new thread`
    });
    let thread = await new message.client.models.threads({
      recipient: message.author.id,
      open: true,
      messages: [],
      mod: "",
      remind: false,
      channel: channel.id
    }).save();
    message.channel.send(
      "Your message has been sent. Please be patient while the mods prepare to reply"
    );
    return thread;
  }
}