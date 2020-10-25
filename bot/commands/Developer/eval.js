module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = true,
        this.aliases = [],
        this.userPerms = [],
        this.botPerms = [],
        this.cooldown = 0,
        this.help = {
            description: 'Evalutes and executes JavaScript code.',
            usage: 'eval <code>',
            examples: 'eval this.client.deleteCapitalism()'
        };
    }

    async run (client, message, args, data) { //eslint-disable-line no-unused-vars
        const code = args.join(' ');
        try {
            const evaled = eval(code);
            const clean = await client.helpers.clean(evaled);
            const MAX_CHARS = 3 + 2 + clean.length + 3;
            if (MAX_CHARS > 2000) {
                return message.channel.createMessage(undefined, { file: Buffer.from(clean), name:  'EVAL_SUCCESS.txt' });
            }
            message.channel.createMessage(`\`\`\`js\n${clean}\n\`\`\``);
        } catch (err) {
            const e = await client.helpers.clean(err);
            const MAX_CHARS = 3 + 2 + e.length + 3;
            if (MAX_CHARS > 2000) {
                return message.channel.createMessage(undefined, { file: Buffer.from(e), name: 'EVAL_ERROR.txt' });
            }

            message.channel.createMessage(`\`\`\`xl\n${e}\n\`\`\``);
        }
    }
};