const Command = require('../../base/Command.js');

class Msearch extends Command {
    constructor (client) {
        super(client, {
            description: 'Lists all members found that match the input',
            usage: '`msearch` [query] - Finds users in this server that match the query.`',
            aliases: ['membersearch']
        });
    }

    async run (message, args, data) { // eslint-disable-line no-unused-vars
        if (!args[0]) return message.channel.send('No username provided.');

        let mlist = '';
        let count = 0;

        this.client.functions.searchForMembers(message.guild, args[0]).forEach((member) => {
            if (member) {
                mlist += `\`${member.user.tag}\``;
                count = count + 1;
            }
            mlist += '**, **';
        });

        mlist = mlist.substring(0, mlist.length - 6);

        const mlist1 = `Found ${count} users:\n` + mlist;

        if (!mlist1) return message.channel.send('No users found!');

        message.channel.send(mlist1);
    }
}

module.exports = Msearch;
