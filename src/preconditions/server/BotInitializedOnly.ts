import { container, Precondition } from '@sapphire/framework'
import { Message } from 'discord.js'
import { configuration } from '@/config'
import { resolveKey } from '@sapphire/plugin-i18next'
import { languageKeys } from '@/utils'

export class BotInitializedOnlyPrecondition extends Precondition {
  public async run(message: Message) {
    const { id: guildId } = message.guild
    const guild = await container.db.guildService.getById(guildId)

    return guild
      ? this.ok()
      : this.error({
          message: await resolveKey(message, languageKeys.preconditions.server.botInitializedOnlyErrorMessage, {
            prefix: configuration.prefix,
          }),
        })
  }
}
