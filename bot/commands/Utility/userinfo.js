const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/relativeTime'));

module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = false,
        this.aliases = [],
        this.userPerms = [],
        this.botPerms = [],
        this.cooldown = 2000,
        this.help = {
            description: '',
            arguments: '',
            details: '',
            examples: ''
        };
    }

    async run (client, message, args, data) { //eslint-disable-line no-unused-vars
        let member = message.member;
        
        if (args[0]) {
            if (message.mentions.length > 0) {
                member = await message.channel.guild.searchMembers(message.mentions[0]);
            } else {
                member = await message.channel.guild.searchMembers(args.join(' '), 2);

                if (member.length < 1) return message.channel.createMessage(
                    `${client.emojis.userError} No users found. Check for mispellings, or ping the user instead.`
                );
        
                if (member.length > 1) return message.channel.createMessage(
                    `${client.emojis.userError} Found more than one user, try refining your search or pinging the user instead.`
                );
        
                member = member[0];
            }
        }

        const embed = new client.RichEmbed()
            .setTitle(member.user.username + '#' + member.user.discriminator)
            .setColour(client.functions.displayHexColour(message.channel.guild, member.id))
            .setThumbnail(member.user.avatarURL || member.user.defaultAvatarURL)
            .addField('Display Name', member.nick || member.user.username, true)
            .addField('User ID', member.id, true)
            .addField('Joined Server', `${dayjs(member.joinedAt).format('D/M/YYYY HH:mm (UTCZ)')}\n*${dayjs().to(member.joinedAt)}*`)
            .addField('Joined Discord', `${dayjs(member.user.createdAt).format('D/M/YYYY HH:mm (UTCZ)')}\n*${dayjs().to(member.user.createdAt)}*`, true);

        message.channel.createMessage({ embed: embed });
    }
};