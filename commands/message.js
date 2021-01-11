const { Command } = require("../classes.js");
const { MessageEmbed } = require("discord.js");

module.exports = class Message extends Command {
  constructor(client) {
    super(client, {
      name: "message",
      description: "Send a message to a server or recipient",
      usage: "[message(text or image)] {'-a'(anonymous reply)}"
    });
  }
  async run(message, args) {
    if (message.channel.type == "text") {
      this.reply(message, args);
    } else if (message.channel.type == "dm") {
      this.dm(message);
    }
  }

  async dm(message) {
    let embed;
    const arr = message.content.split("|");
    if (!arr[0])
      return message.channel.send(
        "Please specify a guild to send a message to. \n Usage: `[guild name or ID] | [message or image]`"
      );
    const guild = message.client.guilds.cache.find(
      g =>
        g.id == arr[0].trim() ||
        g.name.toLowerCase() == arr[0].trim().toLowerCase()
    );
    if (!guild)
      return message.channel.send("An invalid guild has been specified");
    if (!arr[1] && !message.attachments.first())
      return message.channel.send(
        "Please specify some text or attach an image to send to this guild. \n Usage: `[guild name or ID] | [message or image]`"
      );

    const thread =
      (await message.client.models.threads.findOne({
        guild: guild.id,
        recipient: message.author.id,
        open: true
      })) || (await this.createThread(message, guild));

    const log = await message.client.models.logs.findOne({ guild: guild.id });
    if (!log)
      return message.author.send(
        "The guild does not have the ModMail setup yet. Please ask an admin to run the `setup` command"
      );

    thread.messages.push({
      content: arr.slice(1).join(" "),
      attachments: message.attachments.first(),
      author: message.author.id
    });

    embed = new MessageEmbed()
      .setTitle("New Message")
      .setDescription(arr.slice(1).join(" ") || "")
      .setImage(
        message.attachments.first()
          ? message.attachments.first().proxyURL
          : null
      )
      .setColor(message.client.data.colours.green)
      .setTimestamp()
      .setFooter(
        `RECIPIENT - ${message.author.username}`,
        message.author.displayAvatarURL({ dynamic: true })
      );
    let mentions = "";
    for (let id of thread.remind) mentions += `<@!${id}> `;
    message.client.channels.cache
      .get(thread.channel)
      .send(mentions, { embed })
      .catch(err => {
        console.log(err);
        return message.channel.send(
          `An error has occurred. Please try again in a few seconds`
        );
      });
    message.react("✅");
    thread.updated = true;
    await thread.save();
  }

  async createThread(message, guild) {
    const log = await message.client.models.logs.findOne({
      guild: guild.id
    });

    if (!log)
      throw new Error(
        "The guild does not have the ModMail setup yet. Please ask an admin to run the `setup` command"
      );

    const channel = await guild.channels.create(message.author.username, {
      type: "text",
      topic: `ModMail thread for ${message.author.tag} (${message.author.id})`,
      parent: guild.channels.cache.get(log.category),
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
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

    const thread = await new message.client.models.threads({
      guild: guild.id,
      recipient: message.author.id,
      open: true,
      messages: [],
      remind: [],
      channel: channel.id
    }).save();

    message.channel.send(
      "Your message has been sent. Please be patient while the mods prepare to reply"
    );
    return thread;
  }

  async reply(message, args) {
    let embed;
    message.delete();
    const thread = await message.client.models.threads.findOne({
      channel: message.channel.id,
      open: true
    });

    const log = await message.client.models.logs.findOne({
      guild: message.guild.id
    });

    if (!log)
      return message.channel
        .send(
          "This guild does not have the ModMail setup yet. Please ask an admin to run the `setup` command"
        )
        .then(m => m.delete({ timeout: 4000 }));

    if (!message.member.roles.cache.has(log.supportRole))
      return message.channel
        .send("You must be part of the Support Team to contribute to Threads")
        .then(m => m.delete({ timeout: 4000 }));

    if (!thread)
      return message.channel
        .send("This command can only be used in a Thread")
        .then(m => m.delete({ timeout: 4000 }));

    let anon = false;
    if (message.content.toLowerCase().includes("-a")) anon = true;
    for (let e of args) {
      if (e.toLowerCase() == "-a") args.splice(args.findIndex(f => f == e), 1);
    }

    if (!args[0] && !message.attachments.first())
      return message.channel.send("Please send text or an image");

    // try to send the message to the recipient
    embed = new MessageEmbed()
      .setTitle("New Message")
      .setColor(message.client.data.colours.green)
      .setDescription(args.join(" ") || "")
      .setImage(
        message.attachments.first()
          ? message.attachments.first().proxyURL
          : null
      )
      .setTimestamp()
      .setFooter(
        `MODERATOR - ${anon ? "Anonymous" : message.author.username}`,
        anon
          ? message.author.defaultAvatarURL
          : message.author.displayAvatarURL({ dynamic: true })
      );
    await (await message.client.users.fetch(thread.recipient))
      .send({ embed })
      .catch(() => {
        return message.channel.send("Message Failed to send");
      });
    message.channel.send({ embed });

    thread.messages.push({
      author: message.author.id,
      attachments: message.attachments.first(),
      content: args.join(" ")
    });
    thread.updated = true;
    await thread.save();
  }
};
