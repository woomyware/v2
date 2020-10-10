const Command = require("../../base/Command.js");

class Help extends Command {
  constructor (client) {
    super(client, {
      description = "Lists what commands Woomy has, what they do, and how to use them.",
      usage = "'`help` - Lists all commands.\n`help <command>` - Shows detailed information on a specific command.'",
      aliases = ["cmds"]
    });
  }

  async run (message, args, level) { // eslint-disable-line no-unused-vars

  }
}

module.exports = Help;
