const { createLogger, format, transports, addColors } = require("winston");
const { combine, timestamp, printf, colorize } = format;

const fmt = printf(({ level, message, timestamp }) => {
  return `${timestamp} - ${level}: ${message}`;
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
    debug: "magenta",
    cmd: "white",
    info: "cyan",
    ready: "green",
    warn: "yellow",
    error: "red"
  }
};

const logger = createLogger({
  levels: customLevels.levels,
  level: "error",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss"
    }),
    fmt
  ),

  transports: [
    new transports.Console({
      level: "error",
      format: combine(
        timestamp({
          format: "YYYY-MM-DD hh:mm:ss"
        }),
        colorize(),
        fmt
      )
    })
  ]
});

addColors(customLevels.colours);

module.exports = logger;