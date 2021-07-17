const { typeArray, colours } = require('../../assets/pokemon.json');
const fetch = require('node-fetch');

module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = false,
        this.aliases = ['type', 'typematchup'],
        this.userPerms = [],
        this.botPerms = [],
        this.cooldown = 5000,
        this.help = {
            description: 'Get the strengths and weaknesses of a pokemon type/type combination',
            arguments: '<pokemon/type> [type2]',
            details: 'The type2 argument is only needed if you are submitting two types, not a pokemon or singular type.',
            examples: '`effective ghost dragon`\n`effective ribombee`'
        };
    }

    async run (client, message, args, data) { //eslint-disable-line no-unused-vars
        if (!args[0]) return message.channel.send(
            `${client.config.emojis.userError} You didn't give me a pokemon or type combination to look up! Usage: \`${message.prefix + this.name + ' ' + this.help.arguments}\``
        );

        const editMessage = await message.channel.send(`${client.config.emojis.loading} Please wait...`);

        let types;

        if (!typeArray.includes(args[0].toProperCase())) {
            const res = await fetch('https://graphqlpokemon.favware.tech/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': client.config.userAgent
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
                        message.channel.send(
                            `${client.config.emojis.userError} I couldn't find any Pokemon with names similar to ${args.join(' ').toLowerCase()}. Check your spelling, maybe?`
                        );
                    } else {
                        client.logger.error('MATCHUP_API_ERROR', error.message);
                    }
                });

                return;
            }
            types = json.data.getPokemonDetailsByFuzzy.types.map(type => type.toLowerCase());
        } else {
            types = args.map(type => type.toLowerCase());
        }

        fetch('https://graphqlpokemon.favware.tech/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: `
                {
                    getTypeMatchup(types: [${types.join(', ')}]) {
                        attacking { doubleEffectiveTypes effectiveTypes normalTypes resistedTypes doubleResistedTypes effectlessTypes }
                        defending { doubleEffectiveTypes effectiveTypes normalTypes resistedTypes doubleResistedTypes effectlessTypes }
                    }
                }
            `})
        })
            .then(res => res.json())
            .then(json => {
                if (json.errors) {
                    json.errors.forEach(error => {
                        if (error.message.includes('does not exist in "Types')) {
                            message.channel.send(
                                `${client.config.emojis.userError} One or more of the types you gave me are invalid. Check your spelling, maybe?`
                            );
                        } else {
                            client.logger.error('MATCHUP_FETCH_ERROR', error.message);
                        }
                    });
                    return;
                }

                const typeMatchup = json.data.getTypeMatchup;

                let effectless = '';
                if (typeMatchup.attacking.effectlessTypes.length > 0) effectless = `
                **Doesn't effect:**
                ${typeMatchup.attacking.effectlessTypes.map(type => `\`${type.toProperCase()}\``).join(' ')}
                `;

                let immune = '';
                if (typeMatchup.defending.effectlessTypes.length > 0) immune = `
                **Immunities:**
                ${typeMatchup.defending.effectlessTypes.map(type => `\`${type.toProperCase()}\``).join(' ')}
                `;

                const embed = new client.MessageEmbed()
                    .setColor(colours[types[0].toProperCase()])
                    .setTitle('Type effectiveness of ' + types.map(type => type.toProperCase()).join(' and '))
                    .addField('Offensive:', `
                        **Super-effective:**
                        ${this.parseEffectiveTypes(typeMatchup.attacking.effectiveTypes, typeMatchup.attacking.doubleEffectiveTypes)} 
                        **Not very effective:**
                        ${this.parseResistedTypes(typeMatchup.attacking.resistedTypes, typeMatchup.attacking.doubleResistedTypes)}${effectless} 
                    `)
                    .addField('Defensive:', `
                    **Weaknesses:**
                    ${this.parseEffectiveTypes(typeMatchup.defending.effectiveTypes, typeMatchup.defending.doubleEffectiveTypes)} 
                    **Resistances:**
                    ${this.parseResistedTypes(typeMatchup.defending.resistedTypes, typeMatchup.defending.doubleResistedTypes)}${immune}
                `);
                editMessage.edit({ content: null, embeds: [embed] });
            });
    }

    parseEffectiveTypes (effective, doubleEffective) {
        return doubleEffective
            .map(type => `\`${type.toProperCase()} (x4)\``)
            .concat(effective.map(type => `\`${type.toProperCase()} (x2)\``))
            .join(' ');
    }

    parseResistedTypes (resisted, doubleResisted) {
        return doubleResisted
            .map(type => `\`${type.toProperCase()} (x0.25)\``)
            .concat(resisted.map(type => `\`${type.toProperCase()} (x0.5)\``))
            .join(' ');
    }
};