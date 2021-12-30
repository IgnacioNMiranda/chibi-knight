import { container, Events, Listener } from '@sapphire/framework'
import { Guild } from 'discord.js'
import { logger, removeRoles } from '@/utils'

export class GuildDeleteListener extends Listener<typeof Events.GuildDelete> {
  public async run(guild: Guild) {
    const { id: guildId } = guild
    try {
      logger.info(`Trying to leave '${guild.name}' server and delete from DB...`, {
        context: guild.client.constructor.name,
      })
      await container.db.guildService.deleteById(guildId)
      await container.db.userService.deleteGuildDataById(guildId)
      if (guild.me.permissions.has('MANAGE_ROLES')) {
        await removeRoles(guild)
      }
      logger.info(`'${guild.name}' leaved and deleted succesfully`, {
        context: container.client.constructor.name,
      })
    } catch (error) {
      logger.error(`MongoDB Connection error. Could not delete '${guild.name}' server from DB`, {
        context: container.client.constructor.name,
      })
    }
  }
}
