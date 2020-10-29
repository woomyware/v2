module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = false,
        this.aliases = [],
        this.userPerms = ['administrator'],
        this.botPerms = [],
        this.cooldown = 2000,
        this.help = {
            description: 'Say hi!',
            arguments: 'hello',
            details: '',
            examples: ''
        };
    }

    run (client, message, args, data) { // eslint-disable-line no-unused-vars
        return message.channel.createMessage(`Hello, ${message.author.mention}!`);
    }
};