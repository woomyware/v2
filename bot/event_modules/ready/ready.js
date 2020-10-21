module.exports = class {
    constructor (wsEvent) {
        this.wsEvent = wsEvent;
    }

    async run (client) {
        client.editStatus('online', { name: `Goddess of Discord! | v${client.version}`});
        client.logger.event(`Woomy v${client.version} initialized and ready to accept commands!`);
    }
};