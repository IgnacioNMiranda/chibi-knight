import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message } from 'discord.js';
import configuration from '../../config/configuration';
import logger from '../../logger';
import Server from '../../database/models/server.model';
import { ReturnModelType, getModelForClass } from '@typegoose/typegoose';
import { openMongoConnection } from '../../database/mongo';

/**
 * Initialize bot funcionalities setting cache and adding server to BD.
 */
export default class InitChibiKnightCommand extends Command {
  private readonly serverRepository: ReturnModelType<typeof Server>;

  constructor(client: CommandoClient) {
    super(client, {
      name: 'initialize',
      aliases: ['i'],
      group: 'misc',
      memberName: 'initialize',
      description: 'Initialize Chibi Knight funcionalities.',
      hidden: true,
    });

    this.serverRepository = getModelForClass(Server);
  }

  /**
   * It executes when someone types the "initialize" command.
   */
  async run(message: CommandoMessage): Promise<Message> {
    try {
      const mongoose = await openMongoConnection();
      const server = await this.serverRepository.findOne({
        guildId: message.guild.id,
      });
      if (!server) {
        logger.info(`Trying to register new server ${message.guild.name}...`, {
          context: this.constructor.name,
        });
        const newServer: Server = { guildId: message.guild.id };
        await this.serverRepository.create(newServer);
        await mongoose.connection.close();
        logger.info(`${message.guild.name} registered succesfully`, {
          context: this.constructor.name,
        });
        return message.say(
          `${configuration.appName} has been initialize successfully :purple_heart: check out the commands with ${configuration.prefix}help :smile:`,
        );
      } else {
        return message.say(
          `${configuration.appName} has already been initialize n.n`,
        );
      }
    } catch (error) {
      return message.say(
        `It occured an unexpected error while trying to initialize ${configuration.appName} :sweat: try again later.`,
      );
    }
  }
}
