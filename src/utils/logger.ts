import { createLogger, format, Logger, transports, addColors } from 'winston'
const { combine, printf } = format

const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 5,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
  },
}

const formatter = printf(({ level, message, context }) => {
  return `[${level}] (${context}): ${message}`
})

addColors(customLevels.colors)

const logger: Logger = createLogger({
  levels: customLevels.levels,
  format: combine(format.colorize(), formatter),
  transports: [
    // Displays logs in console
    new transports.Console(),
  ],
})

export { logger }
