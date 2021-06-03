import { CommandoMessage } from 'discord.js-commando';
import { app } from '../main';
import { logger } from '../logger';
import { Guild } from './models';

export default class Cache {
  cache: Map<string, Guild>;

  constructor() {
    this.cache = new Map<string, Guild>();
  }

  async initCache() {
    if (this.cache) {
      return this.cache;
    }

    try {
      logger.info('Trying to init cache...', {
        context: this.constructor.name,
      });
      const guilds = await app.guildService.getAll();
      guilds.forEach((guild) => {
        const { guildId, rolesActivated, gameInstanceActive } = guild;
        const cachedGuild: Guild = {
          guildId,
          rolesActivated,
          gameInstanceActive,
        };
        this.set(guildId, cachedGuild);
      });
    } catch (error) {
      logger.error(
        `MongoDB Connection error. Could not init cache from database`,
        {
          context: this.constructor.name,
        },
      );
    }
    return this.cache;
  }

  async refresh() {
    this.cache = new Map<string, Guild>();
  }

  get(resourceId: string): any {
    return this.cache.get(resourceId);
  }

  set(resourceId: string, resource: any) {
    return this.cache.set(resourceId, resource);
  }

  async getGameInstanceActive(message: CommandoMessage): Promise<boolean> {
    if (!message.guild) {
      return false;
    }
    const { id: guildId } = message.guild;
    const cachedGuild = this.get(guildId);
    if (cachedGuild) {
      return cachedGuild.gameInstanceActive;
    } else {
      try {
        const guild = await app.guildService.getById(guildId);
        return guild.gameInstanceActive;
      } catch (error) {
        logger.error(
          `MongoDB Connection error. Could not retrieve gameInstanceActive for '${message.guild.name}' server`,
          {
            context: this.constructor.name,
          },
        );
        throw error;
      }
    }
  }
}
