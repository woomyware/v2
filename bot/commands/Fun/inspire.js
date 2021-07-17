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

    async run (client, message, args, data) { //eslint-disable-line no-unused-vars
        const editMessage = await message.channel.send(`${client.config.emojis.loading} Please wait...`);
        try {
            fetch('http://inspirobot.me/api?generate=true', { headers: { 'User-Agent': client.config.userAgent }})
                .then(res => res.text())
                .then(body => editMessage.edit(body));
        } catch (err) {
            editMessage.edit(`${client.config.emojis.botError} An error has occurred: ${err}`);
        }
    }
};