const Command = require('../../base/Command.js');

class Enable extends Command {
    constructor (client) {
        super(client, {
            description: 'Re-enables a previously disabled command/category.',
            usage: '`enable command [command]` - Enables the specified command.\n`enable category [category]` - Enables the specified category.',
            examples: '`enable command cuddle`\n`enable category music`',
            userPerms: ['ADMINISTRATOR']
        });
    }

    async run (message, args, data) {        
        if (!args[0]) {

            return;
        } else {
            if (!args[1]) return message.channel.send(
                'You didn\'t specify a command/category to enable!'
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
                
                if (!array.includes(command.help.name)) return message.channel.send(
                    'This command isn\'t disabled.'
                );

                array.remove(command.help.name);

                await this.client.db.updateGuild(message.guild.id, 'disabledcommands', array);
    
                return message.channel.send(`Enabled command \`${name}\``);
            }

            if (args[0] === 'category') {
                const array = data.guild.disabledcategories;
                const name = args[1].toProperCase();

                if (!this.client.categories.includes(name)) return message.channel.send(
                    'I couldn\'t find this category. Are you sure you spelt it correctly?'
                );
                
                if (!array.includes(name)) return message.channel.send(
                    'This command isn\'t disabled.'
                );

                array.remove(name);

                await this.client.db.updateGuild(message.guild.id, 'disabledcategories', array);
    
                return message.channel.send(`Enabled category \`${name}\``);
            }
        }

        return message.channel.send('didn\'t specify whether to enable a command or category');
    }
}

module.exports = Enable;
