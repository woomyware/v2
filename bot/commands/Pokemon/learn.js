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
            description: 'Tells you if a Pokemon can learn a move, and if they can, how.',
            arguments: '<pokemon> <move> [generation]',
            details: '',
            examples: 'learn giratina shadow ball '
        };
    }

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        const gens = [1, 2, 3, 4, 5, 6, 7, 8];

        if (!args[0]) return message.channel.createMessage(
            `${client.emojis.userError} You didn't specify any arguments. Usage: ${message.prefix + this.help.name + ' ' + this.help.arguments}`
        );

        if (!gens.includes(args[0])) {
            return; // fix later
        }

        if (!args[1]) return message.channel.createMessage(
            `${client.emojis.userError} You didn't give me a Pokemon to look up!`
        );

        if (!args[2]) return message.channel.createMessage(
            `${client.emojis.userError} You didn't give me a move to look up!`
        );

        message.channel.sendTyping();

        fetch('https://graphqlpokemon.favware.tech/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: `
                {
                    getPokemonLearnsetByFuzzy(pokemon: "${args[0].toLowerCase()}" moves: ["${args[1].toLowerCase}"] generation: ${generation}) {
                        levelUpMoves { name generation level }
                        virtualTransferMoves { name generation }
                        tutorMoves { name generation }
                        tmMoves { name generation }
                        eggMoves { name generation }
                        eventMoves { name generation }
                        dreamworldMoves { name generation }
                        num
                        species
                        sprite
                    }
                }
            `})
        })
            .then((res) => res.json())
            .then((json) => {
                console.log(json)
                if (json.errors) {
                    json.errors.forEach(error => {
                        if (error.message.startsWith('Failed to get data for item')) {
                            message.channel.createMessage(
                                `${client.emojis.userError} I couldn't find any items with names similar to ${query}. Check your spelling, maybe?`
                            );
                        } else {
                            client.logger.error('POKEMON_FETCH_ERROR', error.message);
                        }
                    });

                    return;
                }

                const item = json.data.getItemDetailsByFuzzy;

                const embed = new client.RichEmbed()
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