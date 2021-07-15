const prettified = require ('../../assets/categories.json');

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
            description: 'meta :P',
            arguments: '[command/category]',
            details: 'details',
            examples: 'examples'
        };
    }

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        const commands = client.commands;
        const categories = [];

        commands.forEach(cmd => {
            if (!categories.includes(cmd.category)) {
                if (cmd.category === 'Developer' && !client.config.ownerIDs.includes(message.author.id)) return;
                categories.push(cmd.category);
            } 
        });

        if (!args[0]) {
            const embed = new client.RichEmbed();
            embed.setTitle('Help & Commands');
            embed.setColour(client.functions.displayHexColour(message.channel.guild));
            embed.setDescription(
                `
                » Use \`${message.prefix}help [category]\` to get basic information on all commands in the category.   
                » Use \`${message.prefix}help [command]\` to get full information on a specific command.
                » [Click here](https://discord.gg/HCF8mdv) to join my Discord server if you need help, or just want to hang out!
                » [Click here](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=2134240503&scope=bot) to invite me to your server!
                \n**News:**
                A massive update has just been released! Lots of commands and features have been added or redone and my code has been rewritten to use lots of cool new stuff. To view the full changelog, run \`changelog\`
                ‏‏‎ ‎`
            );
            categories.forEach(category => {
                embed.addField(`${prettified[category].emoji} ${category}`, `*${prettified[category].description}*\n${client.commands.filter(cmd => cmd.category === category).length} commands`, true);
            });
            embed.setFooter('<> = required, / = either/or, [] = optional');

            return message.channel.send({ embed: embed });
        }

        const cat = args[0].toProperCase();
        const cmd = args[0].toLowerCase();

        if (categories.includes(cat)) {
            let cmds = '';
            const filteredCmds = client.commands.filter(cmd => cmd.category === cat);

            filteredCmds.forEach(cmd => {
                let params = '';
                if (cmd.help.arguments.length > 0) params = '`' + cmd.help.arguments + '`';
                cmds += `**${message.prefix + cmd.name}** ${params} ✦ ${cmd.help.description}\n`;
            });

            const embed = new client.RichEmbed()
                .setTitle(prettified[cat].emoji + ' ' + cat)
                .setColour(client.functions.displayHexColour(message.channel.guild))
                .setDescription(cmds)
                .setFooter('<> = required, / = either/or, [] = optional');
            
            return message.channel.send({ embed: embed });
        }

        if (client.commands.has(cmd) || client.aliases.has(cmd)) {
            const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
            const embed = new client.RichEmbed()
                .setTitle(prettified[command.category].emoji + ' ' + command.category + ' -> ' + command.name.toProperCase())
                .setColour(client.functions.displayHexColour(message.channel.guild))
                .setDescription(command.help.description)
                .addField('Format:', `\`${message.prefix + command.name} ${command.help.arguments}`.trim() + '`');
            if (command.help.details.length > 0) embed.addField('Parameters:', command.help.details);
            if (command.help.examples.length > 0) embed.addField('Examples', command.help.examples);
            if (command.aliases.length > 0) embed.addField('Aliases:', '`' + command.aliases.join('`, `') + '`');
            if (command.userPerms.length > 0) embed.addField('User permissions:', command.userPerms.join(', '), true);
            if (command.botPerms.length > 0) embed.addField('Bot permissions:', command.botPerms.join(', '), true);
            embed.addField('Cooldown:', `${command.cooldown / 1000} seconds`, true);
            embed.setFooter('<> = required, / = either/or, [] = optional');
            return message.channel.send({ embed: embed });
        }

        return message.channel.send(`${client.config.emojis.userError} ${cmd} doesn't appear to be a command, alias, or category. Are you sure you spelt it right?`);
    }
};