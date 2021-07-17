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
            description: 'Sends you a strip from the best comic ever',
            arguments: '[daily]',
            details: '',
            examples: '`garfield` - sends a random garfield comic strip\n`garfield daily` - sends the daily strip'
        };
    }

    async run (client, message, args, data) { //eslint-disable-line no-unused-vars   
        let date = 'xxxx';
        if (args[0] && args[0].toLowerCase() === 'daily') date = new Date();
        const editMessage = await message.channel.send(`${client.config.emojis.loading} Please wait...`);
        fetch('`https://garfield-comics.glitch.me/`~SRoMG/?date=' + date, { headers: { 'User-Agent': client.config.userAgent }})
            .then(res => res.json())
            .then(json => {
                const embed = new client.MessageEmbed()
                    .setTitle(`${json.data.name} (No. ${json.data.number})`)
                    .setColor(client.functions.embedColor(message.guild))
                    .setURL('https://www.mezzacotta.net/garfield/?comic=' + json.data.number)
                    .setImage(json.data.image.src);
                editMessage.edit({ embeds: [embed] });
            })
            .catch(err => {
                editMessage.edit(`${client.config.emojis.botError} An error has occurred: ${err}`);
            });
    }
};