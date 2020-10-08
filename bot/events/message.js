// The MESSAGE event runs anytime a message is received
// Note that due to the binding of client to every event, every event
// goes `client, other, args` when this function is run.

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (message) {
    if (message.author.bot) return;

    let data = new Object();

    if (message.content.indexOf(this.client.config.defaultPrefix) !== 0) return;

    const args = message.content.slice(this.client.config.defaultPrefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // Cache uncached members
    if (message.guild && !message.member) await message.guild.fetchMember(message.author);

    const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
    if (!cmd) return;

    if (cmd && cmd.conf.devOnly && this.client.functions.isDeveloper(message.author.id) !== true) {
      return message.channel.send("devs only!");
    }
    if (cmd && !message.guild && cmd.conf.guildOnly) {
      return message.channel.send("This command is unavailable via private message. Please run this command in a guild.");
    }


    message.flags = [];
    while (args[0] &&args[0][0] === "-") {
      message.flags.push(args.shift().slice(1));
    }

    cmd.run(message, args, data);
    this.client.logger.cmd(`Command ran: ${message.content}`);

    // TODO: Command caching if it"s worth it
  }
};
