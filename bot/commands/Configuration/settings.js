const { DiscordAPIError } = require("discord.js");
const { MessageEmbed } = require("discord.js");
const Command = require("../../base/Command.js");

class Settings extends Command {
  constructor (client) {
    super(client, {
      description: "View all of your server's settings.",
			usage: "settings",
			guildOnly: true,
      aliases: ["config"]
    });
  }

  async run (message, args) { // eslint-disable-line no-unused-vars
		const settings = await this.client.db.getGuild(message.guild.id);

		const embed = new MessageEmbed()
			.setAuthor('Settings Panel', message.guild.iconURL({dynamic: true}))
			.setDescription('All the settings for this server are listed below. To set a setting, use `set [setting] [what you want to set it to]')
			.addFields(
				{ name: '**Prefix**', value: settings.prefix }
			)
  }
}

module.exports = Settings;
