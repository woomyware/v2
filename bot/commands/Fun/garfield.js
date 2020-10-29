const fetch = require('node-fetch');
const Embed = require('../../util/embed');

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

    run (client, message, args, data) { //eslint-disable-line no-unused-vars   
        let date = 'xxxx';
        if (args[0] && args[0].toLowerCase() === 'daily') date = new Date();
        message.channel.sendTyping();
        fetch('https://garfield-comics.glitch.me/~SRoMG/?date=' + date)
            .then(res => res.json())
            .then(json => {
                const embed = new Embed()
                    .setTitle(`${json.data.name} (No. ${json.data.number})`)
                    .setColour(client.functions.displayHexColour(message.channel.guild, client.user.id))
                    .setURL('https://www.mezzacotta.net/garfield/?comic=' + json.data.number)
                    .setImage(json.data.image.src);
                message.channel.createMessage({ embed: embed });
            })
            .catch(err => {
                message.channel.createMessage(`${client.constants.emojis.botError} An error has occurred: ${err}`);
            });
    }
};