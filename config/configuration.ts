import * as dotenv from 'dotenv';

dotenv.config();

export default {
  clientId: process.env.CLIENT_ID,
  token: process.env.BOT_TOKEN,
  prefix: process.env.PREFIX,
  embedMessageColor: process.env.EMBED_MESSAGE_COLOR || 0x57a7ef,
};
