import winston from 'winston'

const { combine, timestamp, json, colorize, align, printf } = winston.format

const loggerColorScheme = {
  info: 'blue',
  warn: 'yellow',
  error: 'red'
}

winston.addColors(loggerColorScheme)

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss A',
    }),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
});

export default logger
