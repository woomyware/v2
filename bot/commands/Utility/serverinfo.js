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

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        const guild = message.guild;
        
        const embed = new client.MessageEmbed()
            .setColor(client.functions.embedColor(message.guild))
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL)
            .addField('ID', guild.id, true)
            .addField('Owner', `<@${guild.ownerID}>`, true)
            .addField('Region', guild.region.toProperCase(), true)
            .addField('Boosts', `${guild.premiumSubscriptionCount} (Level ${guild.premiumTier})`, true)
            .addField('Member Count (Approximate)', `${guild.memberCount} (${guild.memberCount - guild.members.filter(member => member.user.bot).length} humans, ${guild.members.filter(member => member.user.bot).length} bots)`, true)
            .addField('Channels', `${guild.channels.size} ()`)
        message.channel.send({ embeds: [embed] });
    }
};