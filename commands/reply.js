const { Command } = require("../classes.js");

module.exports = class Reply extends Command {
  constructor(client) {
    super(client, {
      name: "reply",
      description: "Reply to a ModMail thread",
      aliases: ["r"],
      perm: "mods"
    });
  }
  async run(message, args) {
    let thread = await message.client.models.threads.findOne({
      channel: message.channel.id,
      open: true
    });
    let log = await message.client.models.logs.findOne({});
    if (thread) {
      let anon = false;
      if (message.content.toLowerCase().includes("-a")) anon = true;
        args.forEach(e => {
          if (e.toLowerCase() == "-a")
            args.splice(args.findIndex(f => f == e), 1);
        });
      if (thread.mod == message.author.id) {
        if (!args[0] && !message.attachments.first())
          return message.channel.send("Please send text or an image");

        // try to send the message to the recipient
        await (await message.client.users.fetch(thread.recipient))
          .send(
            `__MODERATOR__ **${
              !anon ? message.author.username : "Anonymous"
            }** => ${args[0] ? args.join(" ") : ""}`,
            message.attachments.array()
          )
          .catch(() => {
            return message.channel.send("Message Failed to send");
          });

        thread.messages.push(message);
        message.channel.send(
          `__MODERATOR__ **${
            !anon ? message.author.username : "Anonymous"
          }** => ${args.join(" ")}`,
          message.attachments.array()
        );
      } else if (thread.mod == "") {
        thread.mod = message.author.id;
        let msg = `__SYSTEM__ => Your thread is now being handled by **${
          !anon ? message.author.username : "Anonymous"
        }**`;
        await (await message.client.users.fetch(thread.recipient))
          .send(msg)
          .catch(() => {
            return message.channel.send("Message Failed to send");
          });
        await message.channel.send(msg);
        msg = `__MODERATOR__ **${
          !anon ? message.author.username : "Anonymous"
        }** => ${args.join(" ")}`;
        (
          await message.client.users.fetch(thread.recipient)
        ).send(msg, message.attachments.array());
        await message.channel.send(msg);

        message.channel.createOverwrite(message.author, {
          SEND_MESSAGES: true,
          READ_MESSAGE_HISTORY: true,
          VIEW_CHANNEL: true
        });
        message.channel.createOverwrite(log.supportRole, {
          VIEW_CHANNEL: true,
          READ_MESSAGE_HISTORY: true,
          SEND_MESSAGE: false
        });

        thread.messages.push({
          content: args.join(" "),
          attachments: message.attachments.array(),
          author: message.author.id
        });
      }
      thread.updated = true;
      await thread.save();
    } else {
      return message.channel.send("This command can only be used in a Thread");
    }
  }
};
