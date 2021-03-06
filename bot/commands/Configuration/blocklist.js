module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = false,
        this.aliases = [],
        this.userPerms = ['administrator'],
        this.botPerms = [],
        this.cooldown = 2000,
        this.help = {
            description: 'Add, remove or list users on the blocklist for this server. User\'s on the blocklist cannot use my commands.',
            arguments: '<add | remove | list> <user>',
            details: '',
            examples: 'blocklist list\nblocklist add @Veemo\nblocklist remove emily'
        };
    }

    async run (client, message, [action, ...user], data) {
        if (!action || action.toLowerCase() === 'list') {
            const list = [];
            for (const userID of data.guild.blocklist) {
                const user = await client.functions.getUser(userID);
                list.push(`${user.username}#${user.discriminator}`);
            }

            if (list.length === 0) return message.channel.createMessage('The server blocklist is currently empty. Use `blocklist add <user>` to add people to the blocklist!');

            const embed = new client.RichEmbed()
                .setTitle('Users on blocklist: ' + data.guild.blocklist.length)
                .setDescription('```' + list.join(', ') + '```')
                .setColour(client.functions.displayHexColour(message.channel.guild));
                
            message.channel.createMessage({ embed: embed });
            
            return;
        }

        action = action.toLowerCase();

        if (action !== 'add' & action !== 'remove') {
            return message.channel.createMessage(`${client.emojis.userError} You didn't specify a valid action. Usage: \`${this.help.usage}\``);
        }

        if (!user) return message.channel.createMessage(
            `${client.emojis.userError} You didn't specify a user. Usage: \`${message.prefix + this.help.usage}\``
        );

        let member;

        if (message.mentions.length > 0) {
            member = await client.functions.getMember(message.channel.guild, message.mentions[0].id);
        } else {
            member = await client.functions.validateUserID(message.channel.guild, user[0]);

            if (!member) {
                member = await message.channel.guild.searchMembers(user.join(' '), 2);
            
                if (member.length === 0) return message.channel.createMessage(
                    `${client.emojis.userError} No users found. Check for mispellings, or ping the user instead.`
                );
        
                if (member.length > 1) return message.channel.createMessage(
                    `${client.emojis.userError} Found more than one user, try refining your search or pinging the user instead.`
                );
        
                member = member[0];
            }
        }

        const blocklist = data.guild.blocklist;

        if (action === 'add') {
            if (member.id === message.channel.guild.ownerID) return message.channel.createMessage(
                `${client.emojis.userError} You can't block the owner, silly!`
            );
            
            if (client.functions.highestRole(member).position >= client.functions.highestRole(message.member).position && message.member.id !== message.channel.guild.ownerID) {
                return message.channel.createMessage(`${client.emojis.userError} This user has a higher role than you, you can't add them to the blocklist!`);
            }

            if (blocklist.includes(member.id)) return message.channel.createMessage(
                `${client.emojis.userError} This user is already on the blocklist, you can't add them twice!`
            );

            blocklist.push(member.id);

            client.db.updateGuild(message.channel.guild.id, 'blocklist', blocklist).then(() => {
                message.channel.createMessage(`${client.emojis.success} Added \`${member.username}#${member.discriminator}\` to the blocklist.`);
            }).catch(error => {
                client.logger.error('GUILD_UPDATE_ERROR', error);
                message.channel.createMessage(`${client.emojis.botError} An error occured while adding this user to the blocklist, please try again! **Error:** ${error}`);
            }) ;

            return;
        }

        if (action === 'remove') {            
            if (client.functions.highestRole(member).position >= client.functions.highestRole(message.member).position && message.member.id !== message.channel.guild.ownerID) {
                return message.channel.createMessage(`${client.emojis.userError} This user has a higher role than you, you can't remove them to the blocklist!`);
            }

            if (!blocklist.includes(member.id)) return message.channel.createMessage(
                `${client.emojis.userError} This user isn't on the blocklist.`
            );

            blocklist.remove(member.id);

            client.db.updateGuild(message.channel.guild.id, 'blocklist', blocklist).then(() => {
                message.channel.createMessage(`${client.emojis.success} Removed \`${member.username}#${member.discriminator}\` from the blocklist.`);
            }).catch(error => {
                client.logger.error('GUILD_UPDATE_ERROR', error);
                message.channel.createMessage(`${client.emojis.botError} An error occured while removing this user from the blocklist, please try again! **Error:** ${error}`);
            }) ;

            return;
        }
    }
};