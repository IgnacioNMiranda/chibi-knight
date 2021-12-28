import { container, Precondition } from '@sapphire/framework'
import { Message } from 'discord.js'
import { configuration } from '@/config'

export class RolesActiveOnlyPrecondition extends Precondition {
  public async run(message: Message) {
    const { id: guildId } = message.guild
    const deactiveRolesError = `${configuration.appName}'s roles are not activated. First, you have to run \`${configuration.prefix}activateroles\``
    const cachedGuild = container.cache.get(guildId)
    if (cachedGuild && !cachedGuild.rolesActivated) {
      return this.error({ message: deactiveRolesError })
    }

    try {
      const guild = await container.db.guildService.getById(guildId)
      if (guild && !guild.rolesActivated) {
        return this.error({ message: deactiveRolesError })
      }
    } catch (error) {
      return this.error({
        message: 'It occured an unexpected error :sweat: try again later.',
      })
    }

    return this.ok()
  }
}
