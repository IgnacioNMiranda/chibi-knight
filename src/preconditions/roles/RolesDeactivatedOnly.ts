import { container, Precondition } from '@sapphire/framework'
import { Message } from 'discord.js'
import { configuration } from '@/config'
import { resolveKey } from '@sapphire/plugin-i18next'
import { languageKeys } from '@/utils'

export class RolesDeactivatedOnlyPrecondition extends Precondition {
  public async run(message: Message) {
    const { id: guildId } = message.guild
    const { appName, prefix } = configuration
    const activatedRolesError = await resolveKey(
      message,
      languageKeys.preconditions.roles.rolesNotActiveOnlyActivatedRolesError,
      { appName, prefix }
    )
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
      const unexpectedErrorMessage = await resolveKey(message, languageKeys.errors.unexpectedError)
      return this.error({
        message: unexpectedErrorMessage,
      })
    }

    return this.ok()
  }
}
