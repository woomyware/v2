const fs = require("fs");

class CommandHandler {
  constructor (client) {
    this.client = client;
  }

  load (name, category) {
    try {
      const path = this.client.path + "/commands/" + category + "/" + name + ".js";
      const props = new (require(path))(this.client);

      this.client.logger.debug(`Loading command ${category}/${name}`);

      props.help.name = name;
      props.help.category = category;

      if (props.init) {
        props.init(this.client);
      }

      this.client.commands.set(props.help.name, props);

      props.conf.aliases.forEach(alias => {
        this.client.aliases.set(alias, props.help.name);
      });

      return;
    } catch (err) {
      return `Failed to load command ${name}: ${err}`;
    }
  }

  loadAll () {
    const commandDirectories = fs.readdirSync("./commands/");
    this.client.logger.debug(`Found ${commandDirectories.length} command directories.`);
    commandDirectories.forEach((dir) => {
      const commandFiles = fs.readdirSync("./commands/" + dir + "/");
      commandFiles.filter((cmd) => cmd.split(".").pop() === "js").forEach((cmd) => {
        cmd = cmd.substring(0, cmd.length - 3);
        const resp = this.load(cmd, dir);
        if (resp) {
          this.client.logger.error(resp);
        }
      });
    });
  }

  async unload (name, category) {
    const path = this.client.path + "/commands/" + category + "/" + name + ".js";

    let command;

    if (this.client.commands.has(name)) {
      command = this.client.commands.get(name);
    } else if (this.client.aliases.has(name)) {
      command = this.client.commands.get(this.client.aliases.get(name));
    };

    if (!command) {
      return `\`${name}\` does not exist as a command or an alias.`
    }

    this.client.logger.debug(`Unloading command ${category}/${name}`);

    if (command.shutdown) {
      await command.shutdown(this.client)
    }
    delete require.cache[require.resolve(path)];
    return false;
  }

  unloadAll () {
    const commandDirectories = fs.readdirSync("./commands/");
    this.client.logger.debug(`Found ${commandDirectories.length} command directories.`);
    commandDirectories.forEach((dir) => {
      const commandFiles = fs.readdirSync("./commands/" + dir + "/");
      commandFiles.filter((cmd) => cmd.split(".").pop() === "js").forEach((cmd) => {
        cmd = cmd.substring(0, cmd.length - 3);
        const resp = this.unload(cmd, dir);
        if (resp) {
          this.client.logger.error(resp);
        }
      });
    });
  }
}

class EventHandler {
  constructor (client) {
    this.client = client;
  }

  load (name) {
    try {
      this.client.logger.debug(`Loading event ${name}`);

      const path = this.client.path + "/events/" + name + ".js";
      const event = new (require(path))(this.client);
      this.client.on(name, (...args) => event.run(...args));
      delete require.cache[require.resolve(path)];

      return;
    } catch (err) {
      return `Failed to load event ${name}: ${err}`;
    }
  }

  unload (name) {

  }

  loadAll () {
    const eventFiles = fs.readdirSync(this.client.path + "/events");
    eventFiles.forEach(file => {
      const name = file.split(".")[0];
      const resp = this.load(name);

      if (resp) {
        this.client.logger.error(resp);
      }
    });
  }
}

module.exports = {
  CommandHandler: CommandHandler,
  EventHandler: EventHandler
};