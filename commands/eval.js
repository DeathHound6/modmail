const { Command } = require("../classes.js");
const { MessageEmbed } = require("discord.js");

module.exports = class Eval extends Command {
  constructor(client) {
    super(client, {
      name: "eval",
      description: "Run JavaScript code",
      perm: "owners",
      usage: "[javascript code]"
    });
  }
  async run(message, args) {
    let embed;
    if (message.client.owners.includes(message.author.id)) {
      try {
        if (!args.length) {
          embed = new MessageEmbed()
            .setTitle("Arguments")
            .setDescription(`Please provide some code to run`)
            .setColor(message.client.data.colours.red)
            .setTimestamp();
          return message.channel.send(embed);
        }

        let codeArr = args.join(" ").split("\n");
        if (!codeArr[codeArr.length - 1].startsWith("return"))
          codeArr[codeArr.length - 1] = `return ${codeArr[codeArr.length - 1]}`;

        const code = `async () => { ${codeArr.join("\n")} }`;

        let out = await eval(code)();
        if (typeof out != "string") out = require("util").inspect(out);

        for (let [key, value] of Object.entries(process.env)) {
          if (["TOKEN", "MONGOCONNECTIONSTRING"].includes(key.toUpperCase()))
            out = out.replace(value, `[${key.toUpperCase()} REDACTED]`);
        }

        message.channel.send(`Typeof output: **${typeof out}**`);
        message.channel.send(out, { split: true, code: "js" });
      } catch (err) {
        message.channel.send(`Typeof output: **${typeof err}**`);
        message.channel.send(err, { split: true, code: "js" });
      }
    } else error();

    function error() {
      message.channel.send("You do not have permission to use this command");
    }

    function sleep(ms) {
      return new Promise(resolve => {
        setTimeout(resolve, ms);
      });
    }
  }
};
