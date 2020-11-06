const Embed = require('../../util/embed');
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
            description: 'Get data on a Pokemon ability.',
            arguments: '<ability>',
            details: '',
            examples: '`ability intimidate`\n`ability moxie`'
        };
    }

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        if (!args[0]) return message.channel.createMessage(
            `${client.constants.emojis.userError} You didn't give me an ability to look up!`
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
                    getAbilityDetailsByFuzzy(ability: "${query}") {
                        name
                        desc
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
                        if (error.message.startsWith('Failed to get data for ability')) {
                            message.channel.createMessage(
                                `${client.constants.emojis.userError} I couldn't find any abilities with names similar to ${query}. Check your spelling, maybe?`
                            );
                        } else {
                            client.logger.error('POKEMON_FETCH_ERROR', error.message);
                        }
                    });

                    return;
                }

                const ability = json.data.getAbilityDetailsByFuzzy;
                if (!ability.desc) return message.channel.createMessage(
                    `${client.constants.emojis.botError} I'm missing data for this ability so I can't show it to you, sorry! ;w;`
                )
                const embed = new Embed()
                    .setColour(client.functions.displayHexColour(message.channel.guild, client.user.id))
                    .setTitle(ability.name.toProperCase())
                    .setDescription(ability.desc)
                    .addField('External Resources:', `[Bulbapedia](${ability.bulbapediaPage}) | [Serebii](${ability.serebiiPage}) | [Smogon](${ability.smogonPage})`);
                message.channel.createMessage({ embed: embed });
            })
            .catch(err => console.log(err));
    }
};