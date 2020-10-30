const fetch = require('node-fetch');
const windrose = require('windrose');
const Embed = require('../../util/embed');

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
            description: '',
            arguments: '',
            details: '',
            examples: ''
        };
    }

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        if (!args[0]) return;
        
        let city = args.join(' ').toProperCase();
        let countryCode = '';
        let location;

        if (args.join(' ').indexOf(',') > -1) {
            const params = city.split(',');
            city = params[0].trim().toProperCase();
            countryCode += ',' + params[1].trim().toUpperCase();
            location = `${city}, ${countryCode.substr(1)}`;
        }

        message.channel.sendTyping();
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city + countryCode}&appid=${client.config.keys.weather}`)
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
    
                    if (!location) location = city + ', ' + json.sys.country;

                    const embed = new Embed()
                        .setTitle(`Weather for ${location}`)
                        .setThumbnail(`https://openweathermap.org/img/wn/${json.weather[0].icon}@4x.png`)
                        .setColour(embedColour)
                        .addField('**Condition:**', json.weather[0].main, true)
                        .addField('**Temperature:**', `${tempCelcius}°C | ${Math.round(json.main.temp * 9/5 - 459.67)}°F`, true)
                        .addField('**Min/Max**:', `
                            ${Math.round(json.main.temp_min - 273.15)}°C - ${Math.round(json.main.temp_max - 273.15)}°C
                            ${Math.round(json.main.temp_min * 9/5 - 459.67)}°F - ${Math.round(json.main.temp_max * 9/5 - 459.67)}°F
                        `, true)
                        .addField('**Humidity:**', `${json.main.humidity}%`, true)
                        .addField('**Wind Speed:**', `${Math.round(json.wind.speed * 10) / 10}km/h | ${Math.round(json.wind.speed * 10 / 1.609344)}mi/h`, true)
                        .addField('**Wind Direction:**', windrose.getPoint(json.wind.deg).name, true)
                        .setFooter('Powered by openweathermap.org');
                    return message.channel.createMessage({ embed:embed });
                } else {
                    if (json.message && json.message === 'city not found') {
                        return message.channel.createMessage(`${client.constants.emojis.userError} You provided an invalid city name or country code. Maybe check your spelling?`);
                    }
                    return message.channel.createMessage(`${client.constants.emojis.botError} API error occured: \`code ${json.cod}: ${json.message}\``);
                }
            });
    }
};