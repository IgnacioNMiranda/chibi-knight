require('dotenv').config();

export default {
  token: process.env.BOT_TOKEN,
  prefix: process.env.PREFIX,
  embedMessageColor: process.env.EMBED_MESSAGE_COLOR || 0x57a7ef,
};
