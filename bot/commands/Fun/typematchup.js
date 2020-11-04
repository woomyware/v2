const Embed = require('../../util/embed');
const colours = require('../../assets/constants/typeColours.json');
const fetch = require('node-fetch');

module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = false,
        this.aliases = ['pokedex', 'dex'],
        this.userPerms = [],
        this.botPerms = [],
        this.cooldown = 5000,
        this.help = {
            description: 'Get useful data on any pokemon you ask me to!',
            arguments: '<pokemon>',
            details: '',
            examples: '`pokemon mudkip`\n`pokemon giratina-origin`'
        };
    }

    async run (client, message, args, data) { //eslint-disable-line no-unused-vars
        if (!args[0]) return message.channel.createMessage(
            `${client.constants.emojis.userError} You didn't give me a pokemon to look up!`
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
                    getPokemonDetailsByFuzzy(pokemon: "${query}") {
                        num
                        species
                        types
                        sprite
                        shinySprite
                        bulbapediaPage
                        serebiiPage
                        smogonPage
                    }
                }
            `})
        })
            .then(res => res.json())
            .then(json => {
                if (json.errors) {
                    json.errors.forEach(error => {
                        if (error.message.startsWith('No Pokémon found')) {
                            message.channel.createMessage(
                                `${client.constants.emojis.userError} I couldn't find any Pokemon with names similar to ${query}. Check your spelling, maybe?`
                            );
                        } else {
                            client.logger.error('POKEMON_FETCH_ERROR', error.message);
                        }
                    });

                    return;
                }

                const pokemon = json.data.getPokemonDetailsByFuzzy;

                console.log(pokemon.types)

                fetch('https://graphqlpokemon.favware.tech/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query: `
                        {
                            getTypeMatchup(types: [water]) {
                                attacking { doubleEffectiveTypes effectiveTypes resistedTypes doubleResistedTypes effectlessTypes }
                            }
                        }
                    `})
                })
                    .then(res => res.json())
                    .then(json => {
                        console.log(json)
                        if (json.errors) {
                            json.errors.forEach(error => {
                                client.logger.error('POKEMON_FETCH_ERROR', error.message);
                            });
        
                            return;
                        }

                        console.log(json.data)
                        const typeMatchup = json.data.getTypeMatchup;

                        let doubleEffective = '';
                        if (typeMatchup.doubleEffectiveTypes && typeMatchup.doubleEffectiveTypes.length > 0) {
                            doubleEffective = '**' + typeMatchup.doubleEffectiveTypes.join('**, **') + '**';
                            doubleEffective = doubleEffective.concat(typeMatchup.effectiveTypes).join(', ');
                        }

                        let doubleResists = '';
                        if (typeMatchup.doubleResistedTypes &&  typeMatchup.doubleResistedTypes.length > 0) {
                            doubleResists = '**' + typeMatchup.doubleResistedTypes.join('** **') + '**';
                            doubleResists = doubleResists.split(' ');
                            doubleResists = doubleResists.concat(typeMatchup.resistedTypes).join(', ');
                        }


                        const embed = new Embed()
                            .setColour(colours[pokemon.types[0]])
                            .setTitle(`${pokemon.species.toProperCase()} (No. ${pokemon.num})`)
                            .setThumbnail(pokemon.sprite)
                            .addField('**Types:**', pokemon.types.join(', '), true)
                            .addField('**Weak to:**', doubleEffective)
                            .addField('**Strong against:**', doubleResists)
                            .addField('**Immune to:**', typeMatchup.effectlessTypes.join(' '))
                            .addField('**External Resources:**', `[Bulbapedia](${pokemon.bulbapediaPage}) | [Serebii](${pokemon.serebiiPage}) | [Smogon](${pokemon.smogonPage})`);
                        message.channel.createMessage({ embed: embed });
                    })
                    .catch(err => client.logger.error('TYPEMATCHUP_CMD_ERROR', err));
            })
            .catch(err => client.logger.error('TYPEMATCHUP_CMD_ERROR', err));
    }
};