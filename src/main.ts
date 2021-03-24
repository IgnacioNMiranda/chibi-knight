// eslint-disable-next-line prettier/prettier
const pathlib = require('path');
import configuration from '../config/configuration';
import { CommandoClient } from 'discord.js-commando';

class App {
  // Instance of the bot client.
  client: CommandoClient;

  // Defines if a game is currently active.
  gameInstanceActive: boolean;

  constructor() {
    this.initClient();
  }

  async initClient() {
    this.client = new CommandoClient({
      commandPrefix: configuration.prefix,
      owner: '768272679051591691',
      invite: '',
    });

    this.client.registry
      .registerDefaultTypes()
      .registerGroups([
        ['games', 'Games commands'],
        ['misc', 'Miscellaneous commands'],
        ['music', 'Music commands'],
      ])
      .registerCommandsIn({
        filter: /^([^.].*)\.(js|ts)$/,
        dirname: pathlib.join(__dirname, './commands'),
      });

    this.client.on('error', console.error).on('warn', console.warn);

    // When Chibi Knight is login.
    this.client.once('ready', () => {
      this.client.user.setActivity('>help');
      this.gameInstanceActive = false;
      console.log(`${this.client.user.username} is online n.n`);
    });

    while (true) {
      console.log('Logging in...');
      try {
        await this.client.login(configuration.token);
        break;
      } catch (error) {
        const { code, method, path } = error;
        console.error(`Error ${code} trying to ${method} to ${path} path`);
      }
    }
  }
}

export const app: App = new App();
