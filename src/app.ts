import { configuration } from '@/config'
import { container, SapphireClient } from '@sapphire/framework'
import { Cache, MongoDatabase } from '@/database'
import { logger } from '@/utils'
import '@sapphire/plugin-logger/register'

const main = async () => {
  const client = new SapphireClient({
    defaultPrefix: configuration.prefix,
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES'],
    loadDefaultErrorListeners: false,
  })

  logger.info(`Initializing application...`, {
    context: client.constructor.name,
  })

  logger.info(`Trying to connect to mongo database...`, {
    context: client.constructor.name,
  })
  try {
    container.db = await MongoDatabase.connect()
    container.cache = await Cache.init()
  } catch (error) {
    logger.error(`Database connection error. Could not connect to databases`, {
      context: client.constructor.name,
    })
  }

  try {
    logger.info('Logging in...', {
      context: client.constructor.name,
    })
    await client.login(configuration.token)
  } catch (error) {
    const { code, method, path } = error
    console.error(`Error ${code} trying to ${method} to ${path} path`)
  }
}

main().catch(() =>
  logger.error('Bot initialization failed', {
    context: container.client.constructor.name,
  })
)
