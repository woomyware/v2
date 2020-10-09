const Command = require("../../base/Command.js");

class Retrieve extends Command {
  constructor (client) {
		super(client, {
			name: "retrieve",
			description: "Retrieves a key's value from the Redis DB.",
			usage: "retrieve [key]",
			guildOnly: true
		});
  }

  async run (message, args, level) { // eslint-disable-line no-unused-vars
		if (!args[0]) return message.channel.send("You didn't specify what key to retrieve!")

		try {
			const res = await this.client.db.guildGet(message.guild.id, args[0])
			message.channel.send(res)
		} catch (err) {
			return message.channel.send(err)
		}
  }
}

module.exports = Retrieve;
