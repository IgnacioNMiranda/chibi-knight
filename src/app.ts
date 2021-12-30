import { configuration } from '@/config'
import { container, SapphireClient } from '@sapphire/framework'
import { Cache, MongoDatabase } from '@/database'
import { i18nConfig, logger } from '@/utils'
import '@sapphire/plugin-logger/register'
import '@sapphire/plugin-i18next/register'

const main = async () => {
  const client = new SapphireClient({
    ...configuration.client,
    intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES'],
    i18n: i18nConfig,
  })

  logger.info(`Initializing application...`, {
    context: client.constructor.name,
  })

  logger.info(`Trying to connect to mongo database...`, {
    context: client.constructor.name,
  })
  container.db = await MongoDatabase.connect()
  container.cache = await Cache.init()

  logger.info('Logging in...', {
    context: client.constructor.name,
  })
  await client.login(configuration.client.token)
}

main().catch((reason) => {
  logger.error(`Bot initialization failed. Error: ${reason}`, {
    context: container.client.constructor.name,
  })
})
