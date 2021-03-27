import pathlib from 'path';
import configuration from './config/configuration';
import { CommandoClient } from 'discord.js-commando';
import logger from './logger';

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
      owner: configuration.clientId,
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
        filter: /^([^.].*)\.js$/,
        dirname: pathlib.join(__dirname, './commands'),
      });

    this.client.on('error', console.error).on('warn', console.warn);

    // When Chibi Knight has login.
    this.client.once('ready', () => {
      this.client.user.setActivity('>help');
      this.gameInstanceActive = false;
      logger.info(`${this.client.user.username} is online n.n`, {
        context: this.constructor.name,
      });
    });

    try {
      logger.info('Logging in...', {
        context: this.constructor.name,
      });
      await this.client.login(configuration.token);
    } catch (error) {
      const { code, method, path } = error;
      console.error(`Error ${code} trying to ${method} to ${path} path`);
    }
  }
}

export const app: App = new App();
