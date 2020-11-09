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
            description: 'Gets information on a held item.',
            arguments: '<item>',
            details: '',
            examples: 'item life orb\nitem griseous orb'
        };
    }

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        if (!args[0]) return message.channel.createMessage(
            `${client.constants.emojis.userError} You didn't give me an item to look up!`
        );

        message.channel.sendTyping();

        const query = args.join(' ').toLowerCase();

        fetch('https://graphqlpokemon.favware.tech/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: `
                {
                    getItemDetailsByFuzzy(item: "${query}") {
                        name
                        desc
                        shortDesc
                        sprite
                        generationIntroduced
                        bulbapediaPage
                        serebiiPage
                        smogonPage
                    }
                }
            `})
        })
            .then((res) => res.json())
            .then((json) => {
                if (json.errors) {
                    json.errors.forEach(error => {
                        if (error.message.startsWith('Failed to get data for item')) {
                            message.channel.createMessage(
                                `${client.constants.emojis.userError} I couldn't find any items with names similar to ${query}. Check your spelling, maybe?`
                            );
                        } else {
                            client.logger.error('POKEMON_FETCH_ERROR', error.message);
                        }
                    });

                    return;
                }

                const item = json.data.getItemDetailsByFuzzy;

                const embed = new Embed()
                    .setColour(client.functions.displayHexColour(message.channel.guild, client.user.id))
                    .setTitle(item.name)
                    .setThumbnail(item.sprite)
                    .addField('External Resources:', `[Bulbapedia](${item.bulbapediaPage}) • [Serebii](${item.serebiiPage}) • [Smogon](${item.smogonPage})`);
                if (item.desc) {
                    embed.setDescription(`${item.desc} Added in Generation ${item.generationIntroduced}.`);
                } else {
                    embed.setDescription(`${item.shortDesc} Added in Generation ${item.generationIntroduced}.`);
                }
                message.channel.createMessage({ embed: embed });
            });
    }
};