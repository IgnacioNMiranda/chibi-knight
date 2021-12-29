import { container } from '@sapphire/framework'

interface LoggerOptions {
  context: string
}

export const logger = {
  debug: (values: string, options?: LoggerOptions) =>
    container.logger.debug(`(${options.context}): ${values}` as unknown as unknown[]),
  error: (values: string, options?: LoggerOptions) =>
    container.logger.error(`(${options.context}): ${values}` as unknown as unknown[]),
  warn: (values: string, options?: LoggerOptions) =>
    container.logger.warn(`(${options.context}): ${values}` as unknown as unknown[]),
  info: (values: string, options?: LoggerOptions) =>
    container.logger.info(`(${options.context}): ${values}` as unknown as unknown[]),
}
