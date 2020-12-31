// require external or built-in modules
const req = require("require-all");

// require local files
const { ModMailClient } = require("./classes.js");

// create local variables
const client = new ModMailClient();

// listen for events
let files = req(`${__dirname}/events`);
for (let eventFile of Object.values(files)) {
  eventFile = new eventFile(client);
  eventFile.emitter.on(eventFile.name, (...args) => eventFile.run(...args));
}

client.login(client.config.token);
