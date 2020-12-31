const { Command } = require("../classes.js");

module.exports = class Eval extends Command {
  constructor(client) {
    super(client, {
      name: "eval",
      description: "Run JavaScript code",
      perm: "owners"
    });
  }
  async run(message, args) {
    let perm = await message.client.models.perms.findOne({});
    if (perm) {
      if (perm.owners.includes(message.author.id)) {
        try {
          let codeArr = args.join(" ").split("\n");
          if (!codeArr[codeArr.length - 1].startsWith("return"))
            codeArr[codeArr.length - 1] = `return ${
              codeArr[codeArr.length - 1]
            }`;

          const code = `async () => { ${codeArr.join("\n")} }`;

          let out = await eval(code)();
          if (typeof out !== "string") out = require("util").inspect(out);
          out = out
            .replace(message.client.config.token, "[TOKEN REDACTED]")
            .replace(
              message.client.config.mongo.connectionString,
              "[DB URI REDACTED]"
            );

          message.channel.send(`Typeof output: **${typeof out}**`);
          message.channel.send(out, { split: true, code: "js" });
        } catch (err) {
          message.channel.send(`Typeof output: **${typeof err}**`);
          message.channel.send(err, { split: true, code: "js" });
        }
      } else error();
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
