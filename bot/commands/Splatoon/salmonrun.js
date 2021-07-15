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
            description: 'Get current map, weapons and gear for salmon run.',
            arguments: '',
            details: '',
            examples: ''
        };
    }

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        message.channel.sendTyping();
        fetch('https://splatoon2.ink/data/coop-schedules.json',  { headers: { 'User-Agent': client.config.userAgent }})
            .then(res => res.json())
            .then(json => {
                fetch('https://splatoon2.ink/data/timeline.json',  { headers: { 'User-Agent': client.config.userAgent }})
                    .then(timelineRes => timelineRes.json())
                    .then(timelineJson => {

                        const embeds = [];

                        if ((json.details[0].start_time * 1000) > Date.now() === true) {
                            embeds.push(
                                new client.RichEmbed()
                                    .setTitle('Upcoming Salmon Run')
                                    .setColour(client.functions.displayHexColour(message.channel.guild))
                                    .setImage('https://splatoon2.ink/assets/splatnet/'+json.details[0].stage.image)
                                    .addField('Map', json.details[0].stage.name, true)
                                    .setFooter(`Starting in ${prettifyMiliseconds(json.details[0].start_time * 1000 - Date.now(), { secondsDecimalDigits: 0 })} | Data provided by splatoon2.ink`)
                            );
                        } else {
                            embeds.push(
                                new client.RichEmbed()
                                    .setTitle('Current Salmon Run')
                                    .setColour(client.functions.displayHexColour(message.channel.guild))
                                    .setThumbnail('https://splatoon2.ink/assets/splatnet'+timelineJson.coop.reward_gear.gear.image)
                                    .setImage('https://splatoon2.ink/assets/splatnet/'+json.details[0].stage.image)
                                    .addField('Map', json.details[0].stage.name, true)
                                    .addField('Reward Gear', timelineJson.coop.reward_gear.gear.name, true)
                                    .addField('Weapons', json.details[0].weapons[0].weapon.name+', '+json.details[0].weapons[1].weapon.name+', '+json.details[0].weapons[2].weapon.name+', '+json.details[0].weapons[3].weapon.name)
                                    .setFooter(`Ending in ${prettifyMiliseconds((json.details[0].end_time * 1000) - Date.now(), { secondsDecimalDigits: 0 })} | Data provided by splatoon2.ink`)
                            );
                        }

                        embeds.push(
                            new client.RichEmbed()
                                .setTitle('Upcoming Salmon Run')
                                .setColour(client.functions.displayHexColour(message.channel.guild))
                                .setImage('https://splatoon2.ink/assets/splatnet/'+json.details[1].stage.image)
                                .addField('Map', json.details[1].stage.name, true)
                                .addField('Weapons', json.details[1].weapons[1].weapon.name+', '+json.details[1].weapons[1].weapon.name+', '+json.details[1].weapons[2].weapon.name+', '+json.details[1].weapons[3].weapon.name)
                                .setFooter(`Starting in ${prettifyMiliseconds(json.details[1].start_time * 1000 - Date.now(), { secondsDecimalDigits: 0 })} | Data provided by splatoon2.ink`)
                        );
                            
                        createPaginationEmbed(message, embeds);
                    });
            })
            .catch(err => {
                message.channel.send(`${client.config.emojis.botError} An error has occurred: ${err}`);
            });    
    }
};