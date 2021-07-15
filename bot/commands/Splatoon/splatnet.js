const fetch = require('node-fetch');
const prettifyMiliseconds = require('pretty-ms');
const { createPaginationEmbed } = require('eris-pagination');

module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = false,
        this.aliases = [],
        this.userPerms = [],
        this.botPerms = [],
        this.cooldown = 30000,
        this.help = {
            description: 'See what is currently on offer in the splatnet shop',
            arguments: '',
            details: '',
            examples: ''
        };
    }

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        message.channel.sendTyping();
        fetch('https://splatoon2.ink//data/merchandises.json',  { headers: { 'User-Agent': client.config.userAgent }})
            .then(res => res.json())
            .then(json => {
                const embeds = [];

                for ( let i = 0; i < json.merchandises.length; i++ ) {
                    const embed = new client.RichEmbed()
                        .setTitle(json.merchandises[i].gear.name)
                        .setThumbnail('https://splatoon2.ink/assets/splatnet' + json.merchandises[i].gear.image)
                        .setColour(client.functions.displayHexColour(message.channel.guild))
                        .addField('Price', (json.merchandises[i].price).toString(), true)
                        .addField('Brand', json.merchandises[i].gear.brand.name, true)
                        .addField('Ability Slots', (json.merchandises[i].gear.rarity + 1).toString(), true)
                        .addField('Main Ability', json.merchandises[i].skill.name, true)
                        .addField('Common Ability', json.merchandises[i].gear.brand.frequent_skill.name, true)
                        .setFooter('Out of stock in ' + prettifyMiliseconds(json.merchandises[i].end_time * 1000 - Date.now()) + ' | Data provided by splatoon2.ink');
                    embeds.push(embed);
                }

                createPaginationEmbed(message, embeds);
            })
            .catch(err => {
                message.channel.send(`${client.config.emojis.botError} An error has occurred: ${err}`);
            });    
    }
};