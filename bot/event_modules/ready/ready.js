module.exports = class {
    constructor (wsEvent) {
        this.wsEvent = wsEvent;
    }

    async run (client) {
        const activity = client.constants.activities.random();
        client.editStatus('online', { name: `${activity.message} | v${client.version}`, type: activity.type});
        client.logger.event(`Logged in as ${client.user.username + '#' + client.user.discriminator} and ready to accept commands! | v${client.version}`);
    }
};