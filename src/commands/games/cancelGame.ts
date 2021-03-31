import { getModelForClass, ReturnModelType } from '@typegoose/typegoose';
import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import logger from '../../logger';
import Server from '../../database/models/server.model';
import { openMongoConnection } from '../../database/mongo';
import { app } from '../../main';

/**
 * Replies the receives message on command.
 */
export default class CancelGameCommand extends Command {
  private readonly serverRepository: ReturnModelType<typeof Server>;

  constructor(client: CommandoClient) {
    super(client, {
      name: 'cancelgame',
      aliases: ['cg'],
      group: 'games',
      memberName: 'cancelgame',
      description: 'Cancels the active game.',
      args: [],
    });

    this.serverRepository = getModelForClass(Server);
  }

  /**
   * It executes when someone types the "say" command.
   */
  async run(message: CommandoMessage): Promise<Message> {
    try {
      const mongoose = await openMongoConnection();
      const server = await this.serverRepository.findOne({
        guildId: message.guild.id,
      });

      if (!server.gameInstanceActive) {
        await mongoose.connection.close();
        return message.say("There's no active game.");
      } else {
        server.gameInstanceActive = false;
        await server.save();
        await mongoose.connection.close();
      }
    } catch (error) {
      logger.error(
        `MongoDB Connection error. Could not change game instance active for '${message.guild.name}' server`,
        {
          context: this.constructor.name,
        },
      );
    }

    const cachedServer = app.cache.cache.get(message.guild.id);
    if (cachedServer) {
      if (!cachedServer.gameInstanceActive) {
        return message.say("There's no active game.");
      }
      cachedServer.gameInstanceActive = false;
      app.cache.cache.set(message.guild.id, cachedServer);
    }
    return message.say('Game cancelled.');
  }
}
