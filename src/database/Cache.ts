import { getModelForClass, ReturnModelType } from '@typegoose/typegoose';
import { CommandoMessage } from 'discord.js-commando';
import logger from '../logger';
import ServerDTO from './dto/server.dto';
import Server from './models/server.model';
import { openMongoConnection } from './mongo';

export default class Cache {
  cache: Map<string, ServerDTO>;
  private readonly serverRepository: ReturnModelType<typeof Server>;

  constructor() {
    this.serverRepository = getModelForClass(Server);
    this.cache = new Map<string, ServerDTO>();
    this.initCache();
  }

  private async initCache() {
    try {
      const mongoose = await openMongoConnection();
      const servers = await this.serverRepository.find();
      servers.forEach((server) => {
        const serverDto: ServerDTO = {
          guildId: server.guildId,
          rolesActivated: server.rolesActivated,
          gameInstanceActive: server.gameInstanceActive,
        };
        this.cache.set(server.guildId, serverDto);
      });
      await mongoose.connection.close();
    } catch (error) {
      logger.error(
        `MongoDB Connection error. Could not init cache from database`,
        {
          context: this.constructor.name,
        },
      );
    }
  }

  async refresh() {
    this.cache = new Map<string, ServerDTO>();
  }

  async getGameInstanceActive(message: CommandoMessage): Promise<any> {
    const cachedServerInstance = this.cache.get(message.guild.id);
    if (cachedServerInstance) {
      return cachedServerInstance.gameInstanceActive;
    } else {
      try {
        const mongoose = await openMongoConnection();
        const server = await this.serverRepository.findOne({
          guildId: message.guild.id,
        });
        await mongoose.connection.close();
        return server.gameInstanceActive;
      } catch (error) {
        logger.error(
          `MongoDB Connection error. Could not retrieve gameInstanceActive for '${message.guild.name}' server`,
          {
            context: this.constructor.name,
          },
        );
        throw new Error(error);
      }
    }
  }
}
