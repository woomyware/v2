const Command = require('../../base/Command.js');

class Retrieve extends Command {
    constructor (client) {
        super(client, {
            description: 'Retrieves a key\'s value from the Postgres DB.',
            usage: 'retrieve [setting]',
            guildOnly: true
        });
    }

    async run (message, args, data) { // eslint-disable-line no-unused-vars
        if (!args[0]) return message.channel.send('You didn\'t specify what database to access!');
        if (args[0].toLowerCase() !== 'guild' && args[0].toLowerCase() !== 'member' && args[0].toLowerCase() !== 'user') {
            return message.channel.send('Invalid database. Valid databases: `guild`, `member`, `user`');
        }

        if (!args[1]) {
            message.channel.send(
                `\`\`\`js
                ${JSON.stringify(data[args[0]])}
                \`\`\``
            );
        } else {
            const res = data[args[0]][args[1]];
            if (!res) return message.channel.send('Invalid key. Check for typing errors and try again.');
            message.channel.send('```' + res + '```');
        }
    }
}

module.exports = Retrieve;
