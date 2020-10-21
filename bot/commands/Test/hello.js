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
        this.cooldown = 2000,
        this.help = {
            description: 'Say hi!',
            usage: 'hello',
            examples: null
        };
    }

    run (client, message, args, data) { // eslint-disable-line no-unused-vars
        return client.createMessage(message.channel.id, `Hello, ${message.author}!`);
    }
};