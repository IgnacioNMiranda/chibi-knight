import { container, Precondition } from '@sapphire/framework'
import { Message } from 'discord.js'
import { configuration } from '@/config'

export class RolesNotActiveOnlyPrecondition extends Precondition {
  public async run(message: Message) {
    const { id: guildId } = message.guild
    const activatedRolesError = `You already have initialize ${configuration.appName}'s roles :relieved: Check yours with **${configuration.prefix}myroles**.`
    const cachedGuild = container.cache.get(guildId)
    if (cachedGuild?.rolesActivated) {
      return this.error({ message: activatedRolesError })
    }

    try {
      const guild = await container.db.guildService.getById(guildId)
      if (guild.rolesActivated) {
        return this.error({ message: activatedRolesError })
      }
    } catch (error) {
      return this.error({
        message: 'It occured an unexpected error :sweat: try again later.',
      })
    }

    return this.ok()
  }
}
