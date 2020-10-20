// Copyright 2020 Emily J. / mudkipscience and contributors. Subject to the AGPLv3 license.

const Eris = require('eris-additions')(require('eris'));
const EventHandler = require('./util/handlers/eventHandler');
// const messageHandler = require('./util/handlers/messageHandler');
const Helpers = require('./util/helpers');
const Database = require('./util/database');
const Logger = require('./util/logger');
const sentry = require('@sentry/node');
const fs = require('fs');
const read = require('fs-readdir-recursive');
const yaml = require('js-yaml');
const config = yaml.safeLoad(fs.readFileSync('../botconfig.yml', 'utf8'));
const version = require('../package.json').version;

class WoomyClient extends Eris.Client {
    constructor (token, options) {
        super(token, options);

        this.config = config;
        this.path = __dirname;
        this.version = version;
        this.commandFiles = read('./commands').filter(file => file.endsWith('.js'));
        this.eventFiles = read('./event_modules').filter(file => file.endsWith('.js'));

        this.logger = Logger;
        this.db = new Database(this);
        this.helpers = new Helpers(this);
        this.eventHandler = new EventHandler(this);
        // this.messageHandler = new messageHandler(this);

        this.commands = new Eris.Collection();
        this.aliases = new Eris.Collection();
        this.cooldowns = new Eris.Collection();
        this.eventModules = new Eris.Collection();
    }

    loadCommands () {
        const nameRegexp = /[^/]*$/;
        const catRegexp = /.+?(?=\/)/;

        for (const file of this.commandFiles) {
            try {
                const props = require(this.path + '/commands/' + file)(this);
                props.help.name = nameRegexp.exec(file);
                props.help.category = catRegexp.exec(file);

                this.commands.set(props.help.name, props);
                this.cooldowns.set(props.help.name, new Map());
                props.conf.aliases.forEach(alias => {
                    this.aliases.set(alias, props.help.name);
                });
            } catch (error) {
                this.logger.error('COMMAND_LOADER_ERROR', error);
            }
        }

        this.logger.success('COMMAND_LOADER_SUCCESS', `Loaded ${this.commands.size}/${this.commandFiles.length} commands.`);
    }

    loadEventModules () {
        const nameRegexp = /[^/]*$/;
        const catRegexp = /.+?(?=\/)/;

        for (const file of this.eventFiles) {
            try {
                const event = require(this.path + '/event_modules/' + file);
                event.wsEvent = catRegexp.exec(file);
                this.eventModules.set(nameRegexp.exec(file), event);
            } catch (error) {
                this.logger.error('EVENT_LOADER_ERROR', error);
            }
        }

        this.logger.success('EVENT_LOADER_SUCCESS', `Loaded ${this.eventModules.size}/${this.eventFiles.length} event modules.`);
    }

    mainEventListener (wsEvent, param_1, param_2) {
        try {
            this.eventHandler.handle(wsEvent, param_1, param_2);
        } catch (error) {
            this.logger.error('MODULE_LISTENER_ERROR', error);
        }
    }

    runReadyModules () {
        this.mainEventListener('ready');
    }

    runErrorModules (error) {
        this.mainEventListener('error', error);
    }

    runMessageCreateModules (message) {
        this.mainEventListener('messageCreate', message);
    }

    runGuildCreateModules (guild) {
        this.mainEventListener('guildCreate', guild);
    }

    runGuildDeleteModules (guild) {
        this.mainEventListener('guildDelete', guild);
    }

    runGuildMemberAddModules (guild, member) {
        this.mainEventListener('guildMemberAdd', guild, member);
    }

    runGuildMemberRemoveModules (guild, member) {
        this.mainEventListener('guildMemberRemove', guild, member);
    }

    runVoiceStateUpdateModules (oldState, newState) {
        this.mainEventListener('voiceStateUpdate', oldState, newState);
    }

    createEventListeners () {
        this.on('ready', this.runReadyModules);
        this.on('error', this.runErrorModules);
        this.on('messageCreate', this.runMessageCreateModules);
        this.on('guildCreate', this.runGuildCreateModules);
        this.on('guildDelete', this.runGuildDeleteModules);
        this.on('guildMemberAdd', this.runGuildMemberAddModules);
        this.on('guildMemberRemove', this.runGuildMemberRemoveModules);
        this.on('voiceStateUpdate', this.runVoiceStateUpdateModules);
    }
}

async function init () {
    const client = new WoomyClient(config.token, { 
        defaultImageFormat: 'png',
        defaultImageSize: 2048,
        intents: [
            'guilds',
            'guildMembers',
            'guildEmojis',
            'guildVoiceStates',
            'guildMessages',
            'guildMessageReactions',
            'directMessages',
            'directMessageReactions'
        ]
    });

    require('./util/prototypes');

    client.loadCommands();
    client.loadEventModules();
    client.createEventListeners();

    if (client.config.devmode === true) {
        try { 
            // sentry.init({ dsn: client.config.keys.sentry });
        } catch (err) { 
            client.logger.error('SENTRY_INIT_ERROR', `Sentry failed to initialize: ${err}`); 
        }
    } else {
        client.logger.warning('DEVELOPMENT_MODE', 'Running in development mode, some features have been disabled.');
    }

    client.connect();
}

init ();

