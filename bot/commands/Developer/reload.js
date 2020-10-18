const Command = require('../../base/Command.js');

class Reload extends Command {
    constructor (client) {
        super(client, {
            description: 'Latency and API response times.',
            usage: '`reload [command]` - Reloads the specified command.',
            examples: '`reload ping`',
            devOnly: true
        });
    }

    async run (message, args, data) { // eslint-disable-line no-unused-vars
        if (!args[0]) return message.channel.send('You didnt tell me what command to reload!');

        let command;

        if (this.client.commands.has(args[0])) {
            command = this.client.commands.get(args[0]);
        } else if (this.client.aliases.has(args[0])) {
            command = this.client.commands.get(this.client.aliases.get(args[0]));
        }

        if (!command) return message.channel.send(
            `\`${args[0]}\` does not exist as a command or an alias.`
        );

        let res = await this.client.commandHandler.unload(command.help.name, command.help.category);
        if (res) return message.channel.send('Error unloading: '+ res);
        
        res = await this.client.commandHandler.load(command.help.name, command.help.category);
        if (res) return message.channel.send('Error loading: ' + res);

        return message.channel.send(`Reloaded \`${args[0]}\``);
    }
}

module.exports = Reload;
