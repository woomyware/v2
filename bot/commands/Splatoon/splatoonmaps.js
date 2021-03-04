const fetch = require('node-fetch');
const prettifyMiliseconds = require('pretty-ms');
const { createPaginationEmbed } = require('eris-pagination');

module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = false,
        this.aliases = ['splatoonmodes'],
        this.userPerms = [],
        this.botPerms = [],
        this.cooldown = 30000,
        this.help = {
            description: 'Get current and upcoming maps and modes for regular, ranked and league battles.',
            arguments: '',
            details: '',
            examples: ''
        };
    }

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        message.channel.sendTyping();
        fetch('https://splatoon2.ink/data/schedules.json', { headers: { 'User-Agent': client.config.userAgent }})
            .then(res => res.json())
            .then(json => {

                const embeds = [
                    new client.RichEmbed()
                        .setTitle('Current Splatoon 2 Maps')
                        .setColour(client.functions.displayHexColour(message.channel.guild))
                        .addField('<:turf_war:814651383911153692> Turf War', `${json.regular[0].stage_a.name}\n${json.regular[0].stage_b.name}`, true)
                        .addField(`<:ranked:814651402479468544> Ranked: ${json.gachi[0].rule.name}`, `${json.gachi[0].stage_a.name}\n${json.gachi[0].stage_b.name}`, true)
                        .addField(`<:league:814651415409590363> League: ${json.league[0].rule.name}`, `${json.league[0].stage_a.name}\n${json.league[0].stage_b.name}`, true)
                        .setFooter(`Maps changing in ${prettifyMiliseconds(json.league[0].end_time * 1000 - Date.now(), { secondsDecimalDigits: 0 })} | Data provided by splatoon2.ink`)
                ];

                for ( let i = 1; i < json.regular.length; i++ ) {
                    const embed = new client.RichEmbed()
                        .setTitle('Upcoming Splatoon 2 Maps')
                        .setColour(client.functions.displayHexColour(message.channel.guild))
                        .addField('<:turf_war:814651383911153692> Turf War', `${json.regular[i].stage_a.name}\n${json.regular[i].stage_b.name}`, true)
                        .addField(`<:ranked:814651402479468544> Ranked: ${json.gachi[i].rule.name}`, `${json.gachi[i].stage_a.name}\n${json.gachi[i].stage_b.name}`, true)
                        .addField(`<:league:814651415409590363> League: ${json.league[i].rule.name}`, `${json.league[i].stage_a.name}\n${json.league[i].stage_b.name}`, true)
                        .setFooter(`Available in ${prettifyMiliseconds(json.league[i].start_time * 1000 - Date.now(), { secondsDecimalDigits: 0 })} | Data provided by splatoon2.ink`);
                    embeds.push(embed);
                }

                createPaginationEmbed(message, embeds);
            })
            .catch(err => {
                message.channel.createMessage(`${client.emojis.botError} An error has occurred: ${err}`);
            });    
    }
};