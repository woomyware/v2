module.exports = class {
    constructor (wsEvent) {
        this.wsEvent = wsEvent;
    }

    async run (client) {
        const activity = client.constants.activities.random();
        client.editStatus('online', { name: `${activity.message} | v${client.version}`, type: activity.type});
    }
};