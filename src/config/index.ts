import { ColorResolvable } from 'discord.js'
import { config } from 'dotenv'

config()

const configuration = {
  env: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'Chibi Knight',
  clientId: process.env.CLIENT_ID,
  token: process.env.BOT_TOKEN,
  prefix: process.env.BOT_PREFIX,
  embedMessageColor: (process.env.EMBED_MESSAGE_COLOR ||
    '#57a7ef') as ColorResolvable,
  mongodb: {
    connection_url: process.env.MONGODB_CONNECTION,
  },
}

export { configuration }
