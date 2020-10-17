const Command = require('../../base/Command.js');

class Userprefix extends Command {
    constructor (client) {
        super(client, {
            description: 'Change the prefix you use for Woomy. This will affect servers and commands in DM\'s.',
            usage: '`userprefix` <new prefix>',
            examples: '`userprefix !!` - Sets your personal prefix to !!'
        });
    }

    async run (message, args, data) { // eslint-disable-line no-unused-vars
        if (!args[0]) {
            return message.channel.send(
                `Your prefix for Woomy is currently: \`${data.user.prefix}\``
            );
        }

        await this.client.db.updateUser(message.author.id, 'prefix', args[0]);
        
        // Update cache
        this.client.prefixCache.set(message.author.id, args[0]);

        message.channel.send(`Your personal prefix has been set to: \`${args[0]}\``);
    }
}

module.exports = Userprefix;
