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

        let member = message.member;
        
        if (args[0]) {
            if (message.mentions.length > 0) {
                member = await client.functions.getMember(message.channel.guild, message.mentions[0].id);
            } else {
                member = await client.functions.validateUserID(message.channel.guild, args[0]);

                if (!member) {
                    member = await message.channel.guild.searchMembers(args.join(' '), 2);
                
                    if (member.length === 0) return message.channel.createMessage(
                        `${client.emojis.userError} No users found. Check for mispellings, or ping the user instead.`
                    );
            
                    if (member.length > 1) return message.channel.createMessage(
                        `${client.emojis.userError} Found more than one user, try refining your search or pinging the user instead.`
                    );
            
                    member = member[0];
                }
            }
        }

        const embed = new client.RichEmbed()
            .setTitle(member.user.username + '#' + member.user.discriminator)
            .setColour(client.functions.displayHexColour(message.channel.guild, member))
            .setImage(member.user.avatarURL);

        message.channel.createMessage({ embed: embed });
    }
};