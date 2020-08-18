// Check that the runtime is up to date
if (Number(process.version.slice(1).split(".")[0]) < 12) {
  console.error(`Node v12.0.0 or higher is required. You have Node ${process.version}. Please update Node on your system.`);
  process.exit(1);
}

// Load up the discord.js library
const { Collection, Client } = require("discord.js");

// Our custom client, extends the standard Discord client with things we will need.
class Custom extends Client {
  constructor (options) {
    super(options);

    this.path = __dirname;
    this.dev = true;
    this.config = require("../config.json");
    this.logger = require("./util/logger");
    this.util = new (require("./util/util"))(this);
    this.messageUtil = new (require("./util/messageUtil"))(this);

    // Create collections to store loaded commands and aliases in
    this.commands = new Collection();
    this.aliases = new Collection();

    const handlers = require("./util/handlers");
    this.commandHandler = new handlers.CommandHandler(this);
    this.eventHandler = new handlers.EventHandler(this);

    // Basically just an async shortcut to using a setTimeout. Nothing fancy!
    this.wait = require("util").promisify(setTimeout);
  }
}

// Initialize client
const client = new Custom();

client.commandHandler.loadAll();
client.eventHandler.loadAll();

if (client.dev === true) {
  client.logger.warn("Development mode is on.");
  client.login(client.config.devtoken);
} else {
  client.login(client.config.token);
}
