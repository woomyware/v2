const fetch = require('node-fetch');
const { colours } = require('../../assets/pokemon.json');

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
        if (!args[0]) return message.channel.send(
            `${client.config.emojis.userError} You didn't give me a pokemon move to look up!`
        );

        message.channel.sendTyping();

        const query = args.join(' ').toLowerCase();

        fetch('https://graphqlpokemon.favware.tech/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': client.config.userAgent
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
                        isZ
                        isGMax
                        contestType
                        bulbapediaPage
                        serebiiPage
                        smogonPage
                        isFieldMove
                    }
                }
            `})
        })
            .then((res) => res.json())
            .then((json) => {
                if (json.errors) {
                    json.errors.forEach(error => {
                        if (error.message.startsWith('Failed to get data for move')) {
                            message.channel.send(
                                `${client.config.emojis.userError} I couldn't find any moves with names similar to ${query}. Check your spelling, maybe?`
                            );
                        } else {
                            client.logger.error('POKEMON_API_ERROR', error.message);
                        }
                    });

                    return;
                }

                const move = json.data.getMoveDetailsByFuzzy;
                
                let suffix = '';

                if (move.isZ) {
                    suffix = ' (Z-Move)';
                } else if (!move.maxMovePower && move.basePower > 0) {
                    suffix = ' (Max Move)';
                } else if (move.isGMax) {
                    suffix = ' (G-Max Move)';
                }

                let fieldEffects = '';
                if (move.isFieldMove) fieldEffects = ' Outside of battle, ' + move.isFieldMove;

                const embed = new client.RichEmbed()
                    .setColour(colours[move.type])
                    .setTitle(move.name.toProperCase() + suffix);
                if (move.desc) {
                    embed.setDescription(move.desc + fieldEffects);
                } else {
                    embed.setDescription(move.shortDesc + fieldEffects);
                }

                embed.addField('Type:', move.type, true);
                embed.addField('Category:', move.category, true);
                embed.addField('Target:', move.target, true);
                if (!move.isZ || move.maxMovePower) embed.addField('Base Power:', move.basePower.toString(), true);
                if (!move.isZ || move.maxMovePower) embed.addField('Z Power:', move.zMovePower.toString(), true);
                if (move.maxMovePower) embed.addField('Max Power:', move.maxMovePower.toString(), true);
                if (!move.isZ) embed.addField('Base PP:', move.pp.toString(), true);
                embed.addField('Accuracy:', move.accuracy.toString(), true);
                embed.addField('Priority:', move.priority.toString(), true);
                if (move.isZ) embed.addField('Z-Crystal:', move.isZ, true);
                if (move.isGMax) embed.addField('G-Max Pokemon:', move.isGMax, true);
                if (move.contestType !== null) embed.addField('Contest Type', move.contestType, true);
                embed.addField('External Resources:', `[Bulbapedia](${move.bulbapediaPage}) • [Serebii](${move.serebiiPage}) • [Smogon](${move.smogonPage})`);
                message.channel.send({ embed: embed });
            });
    }
};