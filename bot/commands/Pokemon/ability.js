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
            `${client.emojis.userError} You didn't give me an ability to look up!`
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
                    getAbilityDetailsByFuzzy(ability: "${query}") {
                        name
                        desc
                        shortDesc
                        bulbapediaPage
                        serebiiPage
                        smogonPage
                        isFieldAbility
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
                                `${client.emojis.userError} I couldn't find any abilities with names similar to ${query}. Check your spelling, maybe?`
                            );
                        } else {
                            client.logger.error('POKEMON_API_ERROR', error.message);
                        }
                    });

                    return;
                }

                const ability = json.data.getAbilityDetailsByFuzzy;

                let fieldEffects = '';
                if (ability.isFieldAbility) {
                    fieldEffects = ` Outside of battle, ${ability.isFieldAbility}`;
                }

                const embed = new client.RichEmbed()
                    .setColour(client.functions.displayHexColour(message.channel.guild, client.user.id))
                    .setTitle(ability.name.toProperCase());
                if (ability.desc) {
                    embed.setDescription(ability.desc + fieldEffects);
                } else {
                    embed.setDescription(ability.shortDesc + fieldEffects);
                }
                embed.addField('External Resources:', `[Bulbapedia](${ability.bulbapediaPage}) • [Serebii](${ability.serebiiPage}) • [Smogon](${ability.smogonPage})`);
                message.channel.createMessage({ embed: embed });
            });
    }
};