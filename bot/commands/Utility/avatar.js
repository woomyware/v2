const Discord = require('discord.js');
const Command = require("../../base/Command.js");

class Avatar extends Command {
  constructor (client) {
    super(client, {
      description: "View a full-sized image of a person's profile picture.",
			usage: "avatar <user>",
			examples: "`avatar` - Gets your avatar.\n`avatar emily` - Gets the avatar of the user 'emily'	",
			aliases: ["pfp"],
			botPerms: ["EMBED_LINKS"]
    });
  }

  async run (message, args, data) { // eslint-disable-line no-unused-vars
		if(!args[0]) {
			const embed = this.createEmbed(message.author);
			return message.channel.send(embed);
		};

		let user = message.mentions.users.first();

		if (!user && message.guild) {
			user = this.client.functions.searchForMembers(message.guild, args[0]);
			if (user.length > 1) {
				return message.channel.send(
					'Found multiple users, please be more specific or @mention the user instead.'
				);
			};

			if (user.length < 1) {
				return message.channel.send(
					'Specified user couldn\'t be found, check for typing errors.'
				);
			};
		};

		user = user[0].user;

		const embed = this.createEmbed(user);
		return message.channel.send(embed);
	};
	
	createEmbed (user) {
		const URL = user.avatarURL({format: "png", dynamic: true, size: 2048})
		const embed = new Discord.MessageEmbed()
			.setTitle(user.tag)
			.setDescription(`**[Avatar URL](${URL})**`)
			.setImage(URL);

		return embed;
	};
};

module.exports = Avatar;
