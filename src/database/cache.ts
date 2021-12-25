import { logger } from '@/utils'
import { container } from '@sapphire/framework'
import { Guild } from './models'

export class Cache {
  public static instance: Cache | null = null
  public readonly cache: Map<string, Guild>

  constructor() {
    this.cache = new Map<string, Guild>()
    setInterval(this.refresh, 1000 * 60 * 60)
  }

  static async init() {
    if (this.instance) {
      return this.instance
    }

    this.instance = new Cache()

    try {
      logger.info('Trying to init cache...', {
        context: container.client.constructor.name,
      })
      const guilds = await container.db.guildService.getAll()
      guilds.forEach((guild) => {
        const { guildId, rolesActivated } = guild
        const cachedGuild: Guild = {
          guildId,
          rolesActivated,
        }
        this.instance.set(guildId, cachedGuild)
      })
    } catch (error) {
      logger.error(
        `MongoDB Connection error. Could not init cache from database`,
        {
          context: this.constructor.name,
        }
      )
    }
    return this.instance
  }

  refresh() {
    this.cache.clear()
  }

  get(resourceId: string): any {
    return this.cache.get(resourceId)
  }

  set(resourceId: string, resource: any) {
    return this.cache.set(resourceId, resource)
  }
}
