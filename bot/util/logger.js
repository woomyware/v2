const { createLogger, format, transports, addColors } = require('winston');

const fmt = format.printf(({ level, message, timestamp }) => {
    return '[' + timestamp + '] ' + level + ' ' + message;
});

const customLevels = {
    levels: {
        debug: 0,
        cmd: 1,
        info: 2,
        ready: 3,
        warn: 4,
        error: 5
    },

    colours: {
        debug: 'black magentaBG',
        cmd: 'black whiteBG',
        info: 'black cyanBG',
        ready: 'black greenBG',
        warn: 'black yellowBG',
        error: 'black redBG'
    }
};

const logger = createLogger({
    levels: customLevels.levels,
    level: 'error',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD hh:mm:ss'
        }),
        fmt
    ),

    transports: [
        new transports.Console({
            level: 'error',
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD hh:mm:ss'
                }),
                format.colorize(),
                fmt
            )
        })
    ]
});

addColors(customLevels.colours);

module.exports = logger;