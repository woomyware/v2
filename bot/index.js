// Copyright 2020 Emily J. / mudkipscience and contributors. Subject to the AGPLv3 license.

const Eris = require('eris-additions')(require('eris'));
const EventHandler = require('./util/handlers/eventHandler');
const messageHandler = require('./util/handlers/messageHandler');
const Helpers = require('./util/helpers');
const Database = require('./util/database');
const Logger = require('./util/logger');
const read = require('fs-readdir-recursive');
const sentry = require('@sentry/node');
const config = require('../botconfig.yml');
const pkg = require('../package.json');

class WoomyClient extends Eris.Client {
    constructor (token, options) {
        super(token, options);

        this.config = config;
        this.path = __dirname;
        this.version = pkg.version;
        this.commandFiles = read('./commands').filter(file => file.endsWith('.js'));
        this.eventFiles = read('./event_modules').filter(file => file.endsWith('.js'));

        this.logger = Logger;
        //this.helpers = new Helpers(this);
        this.db = new Database(this);

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
                this.logger.error('COMMAND_LOADER', error);
            }
        }

        this.logger.success('COMMAND_LOADER', `Successfully loaded ${this.commands.size}/${this.commandFiles.length} commands.`);
    }

    loadEventModules () {
        const nameRegexp = /[^/]*$/;

        for (const file of this.eventFiles) {
            try {
                const event = require(this.path + '/event_modules/' + file)(this);
                this.eventModules.set(nameRegexp.exec(file), event);
            } catch (error) {
                this.logger.error('EVENT_LOADER', error);
            }
        }

        this.logger.success('EVENT_LOADER', `Successfully loaded ${this.eventModules.size}/${this.eventFiles.length} event modules.`);
    }

    mainEventListener (wsEvent, message, other) {
        
    }

    runReadyEvents () {
        this.mainEventListener('ready');
    }

    runErrorEvents (error) {
        this.mainEventListener('error', null, error);
    }

    runGuildCreateEvents (guild) {
        this.mainEventListener('guildCreate', null, guild);
    }

    runGuildDeleteEvents (guild) {
        this.mainEventListener('guildDelete', null, guild);
    }

    runGuildMemberAddEvents () {

    }

    createEventListeners () {
        this.on('ready', );
        this.on('error')
        this.on('messageCreate', this.mainEventLIstener('message', message));
        this.on('guildCreate', );
        this.on('guildDelete', );
        this.on('guildMemberAdd', );
        this.on('guildMemberRemove', );
        this.on('voiceStateUpdate', );
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
            client.logger.error('SENTRY', `Sentry failed to start: ${err}`); 
        }
    } else {
        client.logger.warning('DEVMODE', 'Running in development mode, some features have been disabled.');
    }
}

init ();

