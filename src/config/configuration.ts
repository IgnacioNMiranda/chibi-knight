import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  clientId: process.env.CLIENT_ID,
  token: process.env.BOT_TOKEN,
  prefix: process.env.BOT_PREFIX,
  embedMessageColor: process.env.EMBED_MESSAGE_COLOR || 0x57a7ef,
  mongodb: {
    connection_url: process.env.MONGODB_CONNECTION,
  },
};

export default config;
