import { container, Precondition } from '@sapphire/framework'
import { Message } from 'discord.js'
import { configuration } from '@/config'
import { resolveKey } from '@sapphire/plugin-i18next'
import { languageKeys } from '@/utils'

export class RolesActivatedOnlyPrecondition extends Precondition {
  public async run(message: Message) {
    const { id: guildId } = message.guild
    const {
      appName,
      client: { defaultPrefix: prefix },
    } = configuration
    const deactiveRolesError = await resolveKey(
      message,
      languageKeys.preconditions.roles.rolesActiveOnlyDeactivatedRolesError,
      { appName, prefix }
    )
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
      const unexpectedErrorMessage = await resolveKey(message, languageKeys.errors.unexpectedError)
      return this.error({
        message: unexpectedErrorMessage,
      })
    }

    return this.ok()
  }
}
