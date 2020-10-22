const { ReactionCollector } = require('eris-collector');

module.exports = class {
    constructor (wsEvent) {
        this.wsEvent = wsEvent;
    }

    async run (client, message) {
        /* Creating reaction collector */
        if (message.content === 'createReactionCollector') {

            /* Send informative message */
            const msg = await client.createMessage(message.channel.id, 'This is a reaction collector example!');
            await msg.addReaction('🐝');

            /* Create reaction filter */
            const filter = (m, emoji, userID) => emoji.name === '🐝' && userID === message.author.id;

            /* Create collector */
            const collector = new ReactionCollector(client, msg, filter, {
                time: 1000 * 20
            });

            /* 
            * Emitted when collector collects something suitable for filter 
            * For more information, please see discord.js docs: https://discord.js.org/#/docs/main/stable/class/ReactionCollector
            */
            collector.on('collect', (m, emoji, userID) => {
                console.log(client.createMessage(m.channel.id, `Reaction added by \`${userID}\``));
            });
        }
    }
};