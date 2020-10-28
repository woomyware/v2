const fetch = require('node-fetch');

module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = false,
        this.aliases = ['inspire'],
        this.userPerms = [],
        this.botPerms = [],
        this.cooldown = 2000,
        this.help = {
            description: 'Generates a random (and likely terrible) inspirational quote. Makes use of the Inspirobot API.',
            usage: 'inspirobot',
            examples: null
        };
    }

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        message.channel.sendTyping();
        try {
            fetch('http://inspirobot.me/api?generate=true')
                .then(res => res.text())
                .then(body => message.channel.createMessage(body));
        } catch (err) {
            message.channel.createMessage(`${client.constants.emojis.botError} An error has occurred: ${err}`);
        }
    }
};