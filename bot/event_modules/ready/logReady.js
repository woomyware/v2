module.exports = class {
    constructor (wsEvent) {
        this.wsEvent = wsEvent;
    }

    async run (client) {
        client.logger.event(`${client.user.username + '#' + client.user.discriminator} at your service! | v${client.version}`);
    }
};