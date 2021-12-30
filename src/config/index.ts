import { ColorResolvable } from 'discord.js'
import { config } from 'dotenv'

config()

export const configuration = {
  env: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'Chibi Knight',
  client: {
    clientId: process.env.CLIENT_ID,
    token: process.env.BOT_TOKEN,
    defaultPrefix: process.env.BOT_PREFIX,
    embedMessageColor: (process.env.EMBED_MESSAGE_COLOR || '#57a7ef') as ColorResolvable,
    loadDefaultErrorListeners: process.env.NODE_ENV === 'development',
  },
  mongodb: {
    connection_url: process.env.MONGODB_CONNECTION,
  },
}
