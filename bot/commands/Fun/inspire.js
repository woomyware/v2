const fetch = require('node-fetch');

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
            description: 'Generates a random (and likely terrible) inspirational quote.',
            arguments: '',
            details: '',
            examples: null
        };
    }

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        message.channel.sendTyping();
        try {
            fetch('http://inspirobot.me/api?generate=true', { headers: { 'User-Agent': client.config.userAgent }})
                .then(res => res.text())
                .then(body => message.channel.createMessage(body));
        } catch (err) {
            message.channel.createMessage(`${client.emojis.botError} An error has occurred: ${err}`);
        }
    }
};