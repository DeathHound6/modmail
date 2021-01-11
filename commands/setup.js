const { Command } = require("../classes.js");

module.exports = class Setup extends Command {
  constructor(client) {
    super(client, {
      name: "setup",
      description: "Setup the server",
      aliases: ["set-up"],
      perms: "owners"
    });
  }
  async run(message, args) {
    if (!message.member.permissions.has("MANAGE_GUILD"))
      return message.reply(
        "You don't have the 'Manage Guild' permission required to use this command"
      );

    if (
      !message.guild.me.permissions.has("MANAGE_CHANNELS") ||
      !message.guild.me.permissions.has("MANAGE_ROLES")
    )
      return message.reply(
        "I don't have the `Manage Roles` or `Manage Channels` permissions"
      );

    const log = await message.client.models.logs.findOne({
      guild: message.guild.id
    });
    if (log) return message.reply("This server is already setup");
    
    message.channel.send("Setting up ModMail Support role");
    const role = await message.guild.roles.create({
      data: {
        name: "ModMail Support",
        permissions: [
          "SEND_MESSAGES",
          "READ_MESSAGE_HISTORY",
          "VIEW_CHANNEL",
          "ATTACH_FILES"
        ]
      },
      reason: "Setup command was used"
    });
    message.channel.send("Setting up ModMail Category");
    const cat = await message.guild.channels.create("ModMail", {
      type: "category",
      topic: "The category used for all the ModMail threads and logs",
      reason: "Setup command was used",
      permissionOverwrites: [
        {
          id: role.id,
          allow: [
            "READ_MESSAGE_HISTORY",
            "SEND_MESSAGES",
            "VIEW_CHANNEL",
            "ATTACH_FILES"
          ]
        },
        {
          id: message.guild.roles.everyone.id,
          deny: ["READ_MESSAGE_HISTORY", "SEND_MESSAGES", "VIEW_CHANNEL"]
        }
      ]
    });
    
    message.channel.send("Setting up ModMail Logs channel");
    const logChannel = await message.guild.channels.create("modmail-logs", {
      type: "text",
      topic: "Text Channel used for the logging of closed ModMail Threads",
      parent: cat,
      reason: "Setup command was used",
      permissionOverwrites: [
        {
          id: role.id,
          deny: ["SEND_MESSAGES", "ATTACH_FILES"],
          allow: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY"]
        },
        {
          id: message.guild.roles.everyone.id,
          deny: [
            "VIEW_CHANNEL",
            "READ_MESSAGE_HISTORY",
            "SEND_MESSAGES",
            "ATTACH_FILES"
          ]
        }
      ]
    });
    
    const doc = {
      guild: message.guild.id,
      logs: logChannel.id,
      supportRole: role.id,
      category: cat.id
    };
    await new message.client.models.logs(doc).save();
    message.reply("The server has successfully been setup");
  }
};
