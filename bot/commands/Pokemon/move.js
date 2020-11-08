const fetch = require('node-fetch');
const Embed = require('../../util/embed');
const { colours } = require('../../assets/constants/pokemon.json');

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
            description: 'Gets information on a pokemon move.',
            arguments: '<move>',
            details: '',
            examples: `${this.name} roar of time\n${this.name} shadow ball`
        };
    }

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        if (!args[0]) return message.channel.createMessage(
            `${client.constants.emojis.userError} You didn't give me a pokemon move to look up!`
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
                    getMoveDetailsByFuzzy(move: "${query}") {
                        name
                        desc
                        shortDesc
                        type
                        basePower
                        zMovePower
                        maxMovePower
                        pp
                        category
                        accuracy
                        priority
                        target
                        contestType
                        isZ
                        isGMax
                        bulbapediaPage
                        serebiiPage
                        smogonPage
                    }
                }
            `})
        })
            .then((res) => res.json())
            .then((json) => {
                console.log(json)
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
                const embed = new Embed()
                    .setColour(client.functions.displayHexColour(message.channel.guild, client.user.id))
                    .setTitle(ability.name.toProperCase());
                if (ability.desc) {
                    embed.setDescription(ability.desc);
                } else {
                    embed.setDescription(ability.shortDesc);
                }
                embed.addField('External Resources:', `[Bulbapedia](${ability.bulbapediaPage}) | [Serebii](${ability.serebiiPage}) | [Smogon](${ability.smogonPage})`);
                message.channel.createMessage({ embed: embed });
            })
            .catch(err => console.log(err));
    }
};