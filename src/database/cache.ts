import { CommandoMessage } from 'discord.js-commando'
import { app } from '@/index'
import { logger } from '@/utils'
import { Guild } from './models'

export class Cache {
  cache: Map<string, Guild>

  constructor() {
    this.cache = new Map<string, Guild>()
  }

  async initCache() {
    if (this.cache) {
      return this.cache
    }

    try {
      logger.info('Trying to init cache...', {
        context: this.constructor.name,
      })
      const guilds = await app.guildService.getAll()
      guilds.forEach((guild) => {
        const { guildId, rolesActivated } = guild
        const cachedGuild: Guild = {
          guildId,
          rolesActivated,
        }
        this.set(guildId, cachedGuild)
      })
    } catch (error) {
      logger.error(
        `MongoDB Connection error. Could not init cache from database`,
        {
          context: this.constructor.name,
        }
      )
    }
    return this.cache
  }

  async refresh() {
    this.cache = new Map<string, Guild>()
  }

  get(resourceId: string): any {
    return this.cache.get(resourceId)
  }

  set(resourceId: string, resource: any) {
    return this.cache.set(resourceId, resource)
  }
}
