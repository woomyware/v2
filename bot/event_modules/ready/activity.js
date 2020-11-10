const activities = require('../../assets/activities.json');

module.exports = class {
    constructor (wsEvent) {
        this.wsEvent = wsEvent;
    }

    async run (client) {
        const activity = activities.random();
        client.editStatus('online', { name: `${activity.message} | v${client.version}`, type: activity.type});
    }
};