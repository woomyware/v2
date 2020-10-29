const Embed = require('../../util/embed');

module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = false,
        this.aliases = ['color'],
        this.userPerms = [],
        this.botPerms = [],
        this.cooldown = 2000,
        this.help = {
            description: 'Shows you colours that can be random, a hex code or generated from the words you type into the command.',
            arguments: '[hexcode/text]',
            details: '',
            examples: '`colour` - generates a random colour\n`colour #ee79ff` - Displays the colour of this hexcode\n`colour alpaca` - Generates a colour from the word alpaca'
        };
    }

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        let colour;

        if (!args[0]) {
            colour = client.functions.randomColour();
        } else if (args[0].match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
            colour = args[0];
        } else {
            let hash = 0;
            const string = args.join(' ');
            for (let i = 0; i < string.length; i++) {
                hash = string.charCodeAt(i) + ((hash << 5) - hash);
            }
            colour = '#';
            for (let i = 0; i < 3; i++) {
                const value = (hash >> (i * 8)) & 0xFF;
                colour += ('00' + value.toString(16)).substr(-2);
            }
        }

        const embed = new Embed()
            .setTitle(colour)
            .setColour(colour)
            .setImage(`https://fakeimg.pl/256x256/${colour.replace('#', '')}/?text=%20`);
        
        message.channel.createMessage({ embed: embed });
    }
};