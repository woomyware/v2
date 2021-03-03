module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = false,
        this.aliases = ['pfp'],
        this.userPerms = [],
        this.botPerms = [],
        this.cooldown = 2000,
        this.help = {
            description: 'View a full-sized version of someone\'s avatar.',
            arguments: '<user>',
            details: '',
            examples: 'avatar\navatar @May\navatar emily'
        };
    }

    async run (client, message, args, data) { //eslint-disable-line no-unused-vars

        let user = message.author;
        
        if (args[0]) {
            user = message.mentions[0];

            if (!user) {
                user = await message.channel.guild.searchMembers(args.join(' '), 2);

                if (user.length < 1) return message.channel.createMessage(
                    `${client.emojis.userError} No users found. Check for mispellings, or ping the user instead.`
                );
        
                if (user.length > 1) return message.channel.createMessage(
                    `${client.emojis.userError} Found more than one user, try refining your search or pinging the user instead.`
                );
        
                user = user[0].user;
            }
        }

        const embed = new client.RichEmbed()
            .setTitle(user.username + '#' + user.discriminator)
            .setColour(client.functions.displayHexColour(message.channel.guild, user.id))
            .setImage(user.avatarURL);

        message.channel.createMessage({ embed: embed });
    }
};