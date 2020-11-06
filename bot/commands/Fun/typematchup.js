const Embed = require('../../util/embed');
const { typeArray, colours } = require('../../assets/constants/pokemon.json');
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
            examples: '`pokemon mudkip`\n`pokemon giratina origin`'
        };
    }

    async run (client, message, args, data) { //eslint-disable-line no-unused-vars
        if (!args[0]) return message.channel.createMessage(
            `${client.constants.emojis.userError} You didn't give me a pokemon or type combination to look up! Usage: \`${message.prefix + this.name + ' ' + this.help.arguments}\``
        );

        message.channel.sendTyping();

        let types;

        if (!typeArray.includes(args[0].toProperCase())) {
            const res = await fetch('https://graphqlpokemon.favware.tech/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: `
                    {
                        getPokemonDetailsByFuzzy(pokemon: "${args.join(' ').toLowerCase()}") {
                            types
                        }
                    }
                `})
            });
            const json = await res.json();
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
            console.log(json)
            types = json.data.getPokemonDetailsByFuzzy.types.join(', ').toLowerCase();
        } else {
            types = args.join(', ').toLowerCase();
        }

        fetch('https://graphqlpokemon.favware.tech/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: `
                {
                    getTypeMatchup(types: [${types}]) {
                        attacking { doubleEffectiveTypes effectiveTypes normalTypes resistedTypes doubleResistedTypes effectlessTypes }
                        defending { doubleEffectiveTypes effectiveTypes normalTypes resistedTypes doubleResistedTypes effectlessTypes }
                    }
                }
            `})
        })
            .then(res => res.json())
            .then(json => {
                console.log(json.data)
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

                const typeMatchup = json.data.getTypeMatchup;
                            
                const embed = new Embed()
                    .setTitle('Offensive')
                    .addField('Weak to:', typeMatchup.attacking.effectiveTypes.join(', '))
                    .addField('Strong against:', typeMatchup.attacking.resistedTypes.join(', '));
                    //.addField('Immune to:', typeMatchup.effectlessTypes.join(' '));
                    //.addField('External Resources:', `[Bulbapedia](${pokemon.bulbapediaPage}) | [Serebii](${pokemon.serebiiPage}) | [Smogon](${pokemon.smogonPage})`);
                message.channel.createMessage({ embed: embed });
            })
            .catch(err => client.logger.error('TYPEMATCHUP_CMD_ERROR', err.stack));
    }

    parseEffectiveTypes (effective, doubleEffective) {

    }

    parseResistedTtypes (resisted, doubleResisted) {

    }


};