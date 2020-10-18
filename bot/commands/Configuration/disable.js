const Command = require('../../base/Command.js');

class Disable extends Command {
    constructor (client) {
        super(client, {
            description: 'Disables a command/category so they can\'t be used in this server.',
            usage: '`disable command [command]` - Disables the specified command.\n`disable category [category]` - Disables the specified category.',
            examples: '`disable command cuddle`\n`disable category music`',
            userPerms: ['ADMINISTRATOR']
        });
    }

    async run (message, args, data) {
        const essentialCategories = [
            'Configuration',
            'Developer'
        ];

        const essentialCommands = [
            'help'
        ];

        if (!args[0]) {

            return;
        } else {
            if (!args[1]) return message.channel.send(
                'You didn\'t specify a command/category to disable!'
            );

            if (args[0] === 'command') {
                const array = data.guild.disabledcommands;
                const name = args[1].toLowerCase();
                let command;
                
                if (this.client.commands.has(name)) {
                    command = this.client.commands.get(name);
                } else if (this.client.aliases.has(name)) {
                    command = this.client.commands.get(this.client.aliases.get(name));
                }

                if (!command) return message.channel.send(
                    `\`${args[0]}\` does not exist as a command or an alias.`
                );

                if (essentialCategories.includes(command.help.category) || essentialCommands.includes(command.help.name)) {
                    return message.channel.send('This command is essential, and cannot be disabled.');
                }
                
                if (array.includes(command.help.name)) return message.channel.send(
                    'This command has already been disabled. Use `enable` to re-enable it.'
                );

                array.push(command.help.name);

                await this.client.db.updateGuild(message.guild.id, 'disabledcommands', array);
    
                return message.channel.send(`Disabled command \`${name}\``);
            }

            if (args[0] === 'category') {
                const array = data.guild.disabledcategories;
                const name = args[1].toProperCase();

                if (!this.client.categories.includes(name)) return message.channel.send(
                    'I couldn\'t find this category. Are you sure you spelt it correctly?'
                );

                if (essentialCategories.includes(name)) return message.channel.send(
                    'This category is essential, and cannot be disabled.'
                );
                
                if (array.includes(name)) return message.channel.send(
                    'This command has already been disabled. Use `enable` to re-enable it.'
                );

                array.push(name);

                await this.client.db.updateGuild(message.guild.id, 'disabledcategories', array);
    
                return message.channel.send(`Disabled category \`${name}\``);
            }
        }

        return message.channel.send('didn\'t specify whether to disable a command or category');
    }
}

module.exports = Disable;
