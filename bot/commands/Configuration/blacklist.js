const Command = require('../../base/Command.js');

class Blacklist extends Command {
    constructor (client) {
        super(client, {
            description: 'Add and remove users from the blacklist, preventing them from using commands in this server.',
            usage: '`blacklist [add <user> | remove <user>]`',
            examples: '`blacklist`\n`blacklist add @annoyinguser123`\n`blacklist remove @cooluser456`',
            userPerms: ['ADMINISTRATOR'],
            guildOnly: true
        });
    }

    async run (message, [action, ...user], data) { // eslint-disable-line no-unused-vars
        if (!action) {
            return;
        } else {
            if (!user) return message.channel.send(
                'You didn\'t specify a user!'
            );

            let member = message.mentions.users.first();

            if (!member && message.guild) {
                member = this.client.functions.searchForMembers(message.guild, user);
                if (member.length > 1) {
                    return message.channel.send(
                        'Found multiple users, please be more specific or @mention the user instead.'
                    );
                }
    
                if (member.length < 1) {
                    return message.channel.send(
                        'Specified user couldn\'t be found, check for typing errors.'
                    );
                }
            }
    
            member = member[0];

            const array = data.guild.blacklist;
            
            action = action.toLowerCase();

            if (action === 'add') {
                if (member.user.id === message.guild.owner.id) return message.channel.send(
                    'You can\'t add the owner to the blocklist!'
                );

                if (member.roles.highest.position >= message.guild.member(message.author).roles.highest.position && message.author.id !== message.guild.ownerID) {
                    return message.channel.send(
                        'You can\'t add people higher ranked than yourself to the blocklist!'
                    );
                }

                if (array.includes(member.user.id)) return message.channel.send(
                    'This user has already been blacklisted.'
                );

                array.push(member.user.id);

                await this.client.db.updateGuild(message.guild.id, 'blacklist', array);
                
                return message.channel.send(
                    `Added \`${member.user.tag}\` to the blocklist.`
                );
            }

            if (action === 'remove') {
                if (member.roles.highest.position >= message.guild.member(message.author).roles.highest.position && message.author.id !== message.guild.ownerID) {
                    return message.channel.send(
                        'You can\'t remove people higher ranked than yourself from the blocklist!'
                    );
                }

                if (!array.includes(member.user.id)) return message.channel.send(
                    'This user isn\'t blacklisted.'
                );

                array.remove(member.user.id);

                await this.client.db.updateGuild(message.guild.id, 'blacklist', array);
                
                return message.channel.send(
                    `Removed \`${member.user.tag}\` from the blocklist.`
                );
            }
        }
    }
}

module.exports = Blacklist;
