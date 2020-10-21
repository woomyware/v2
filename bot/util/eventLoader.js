const read = require('fs-readdir-recursive');

class EventLoader {
    constructor (client) {
        this.client = client;
        this.eventFiles = read('./event_modules').filter(file => file.endsWith('.js'));
    }

    // Load all our event modules
    loadEventModules () {
        for (const file of this.eventFiles) {
            try {
                const name = file.substr(file.indexOf('/') + 1).slice(0, -3);
                const category = file.substr(0, file.indexOf('/'));
                const event = new (require(this.client.path + '/event_modules/' + file))(category);
                this.client.eventModules.set(name, event);
            } catch (error) {
                this.client.logger.error('EVENT_LOADER_ERROR', `Failed to load ${file}: ${error}`);
            }
        }

        this.client.logger.success('EVENT_LOADER_SUCCESS', `Loaded ${this.client.eventModules.size}/${this.eventFiles.length} event modules.`);
    }

    // Reloads all currently loaded events, so we don't need to restart to apply changes
    reloadEventModules () {
        this.client.eventModules.forEach((props, event) => {
            try {
                delete require.cache[require.resolve(`${this.client.path}/event_modules/${props.wsEvent}/${event}.js`)];
                this.client.eventModules.delete(event);
            } catch (error) {
                this.client.logger.error('EVENT_LOADER_ERROR', `Failed to unload ${event}: ${error}`);
            }
        });

        this.loadEventModules();
    }
}

module.exports = EventLoader;