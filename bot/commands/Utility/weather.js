const fetch = require('node-fetch');
const windrose = require('windrose');
const ISO2 = require('../../assets/ISO2.json');


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
            description: 'Gives you the weather for the specified city. You can also specify a country code with a comma.',
            arguments: '<city>, [code]',
            details: '`<city>` - name of a city\n`[code]` - country code (USA = US, Australia = AU, etc.)',
            examples: 'w!weather Minneapolis\nw!weather Melbourne, AU'
        };
    }

    async run (client, message, args, data) { //eslint-disable-line no-unused-vars
        if (!args[0]) return;
        
        let city = args.join(' ').toProperCase();
        let countryCode = ',';

        if (args.join(' ').indexOf(',') > -1) {
            const params = city.split(',');
            city = params[0].trim().toProperCase();
            if (ISO2.country[params[1].toProperCase().trim()]) {
                countryCode += ISO2.country[params[1].toProperCase().trim()];
            } else {
                countryCode += params[1].trim();
            }
        }

        const editMessage = await message.channel.send(`${client.config.emojis.loading} Please wait...`);
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city + countryCode}&appid=${client.config.keys.weather}`, { headers: { 'User-Agent': client.config.userAgent }})
            .then(res => res.json())
            .then(json => {
                if (json.cod >= 200 && json.cod <= 299) {
                    const tempCelcius = Math.round(json.main.temp - 273.15);
                    let embedColour;
                    if (tempCelcius < 0) {
                        embedColour = '#addeff';
                    } else if (tempCelcius < 20) {
                        embedColour = '#4fb8ff';
                    } else if (tempCelcius < 26) {
                        embedColour = '#ffea4f';
                    } else if (tempCelcius < 31) {
                        embedColour = '#ffa14f';
                    } else {
                        embedColour = '#ff614f';
                    }

                    const embed = new client.MessageEmbed()
                        .setTitle(`Weather for ${city + ', ' + ISO2.code[json.sys.country]}`)
                        .setThumbnail(`https://openweathermap.org/img/wn/${json.weather[0].icon}@4x.png`)
                        .setColor(embedColour)
                        .addField('Condition:', json.weather[0].main, true)
                        .addField('Temperature:', `${tempCelcius}°C | ${Math.round(json.main.temp * 9/5 - 459.67)}°F`, true)
                        .addField('Min/Max:', `
                            ${Math.round(json.main.temp_min - 273.15)}°C - ${Math.round(json.main.temp_max - 273.15)}°C
                            ${Math.round(json.main.temp_min * 9/5 - 459.67)}°F - ${Math.round(json.main.temp_max * 9/5 - 459.67)}°F
                        `, true)
                        .addField('Humidity:', `${json.main.humidity}%`, true)
                        .addField('Wind Speed:', `${Math.round(json.wind.speed * 10) / 10}km/h | ${Math.round(json.wind.speed * 10 / 1.609344)}mi/h`, true)
                        .addField('Wind Direction:', windrose.getPoint(json.wind.deg).name, true)
                        .setFooter('Powered by openweathermap.org');
                    return editMessage.edit({ content: null, embeds: [embed] });
                } else {
                    if (json.message && json.message === 'city not found') {
                        return message.channel.send(`${client.config.emojis.userError} You provided an invalid city name. Maybe check your spelling?`);
                    }
                    return message.channel.send(`${client.config.emojis.botError} API error occured: \`code ${json.cod}: ${json.message}\``);
                }
            })
            .catch(err => {
                return message.channel.send(`${client.config.emojis.botError} An error has occured: \`${err.stack}\``);
            });
    }
};