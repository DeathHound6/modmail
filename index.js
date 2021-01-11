String.prototype.toProperCase = function() {
  const arg = this.split(" ");
  let toRet = "";
  for (let a of arg) {
    toRet += a.toLowerCase().replace(a.charAt(0), a.charAt(0).toUpperCase());
    toRet += " ";
  }
  toRet = toRet.trim();
  return toRet;
}

// require external or built-in modules
const req = require("require-all");
require("dotenv").config();

// require local files
const { ModMailClient } = require("./classes.js");

// create local variables
const client = new ModMailClient({
  allowedMentions: {
    parse: ["roles", "users", "everyone"]
  },
  fetchAllMembers: true,
  ws: {
    intents: require("discord.js").Intents.ALL
  },
  presence: {
    afk: true,
    status: "dnd",
    activity: {
      name: "Booting Up",
      type: "PLAYING"
    }
  }
});

// listen for events
let files = req(`${__dirname}/events`);
for (let eventFile of Object.values(files)) {
  eventFile = new eventFile(client);
  eventFile.emitter.on(eventFile.name, (...args) => eventFile.run(...args));
}

client.login(client.config.token);
