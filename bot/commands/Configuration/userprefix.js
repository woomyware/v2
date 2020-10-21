module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.guildOnly = false,
        this.devOnly = false,
        this.aliases = [],
        this.userPerms = [],
        this.botPerms = [],
        this.cooldown = 10000,
        this.help = {
            description: 'Sets your own personal prefix for woomy, that works in all servers and DM\'s.',
            usage: 'userprefix` <new prefix>',
            examples: 'userprefix w! - sets your personal prefix to woomy'
        };
    }

    async run (client, message, args, data) {
        if (!args[0]) {
            return message.channel.createMessage(
                `Your prefix for Woomy is currently: \`${data.user.prefix}\``
            );
        }

        await client.db.updateUser(message.author.id, 'prefix', args[0]);

        message.channel.createMessage(`Your personal prefix has been set to: \`${args[0]}\``);
    }
};