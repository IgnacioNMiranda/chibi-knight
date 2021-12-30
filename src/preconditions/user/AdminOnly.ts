import { Precondition } from '@sapphire/framework'
import { resolveKey } from '@sapphire/plugin-i18next'
import { GuildMember, Message } from 'discord.js'
import { languageKeys } from '@/utils'

export class AdminOnlyPrecondition extends Precondition {
  public async run(message: Message) {
    const user: GuildMember = await message.guild.members.fetch(message.author.id)

    return user.permissions.has('ADMINISTRATOR')
      ? this.ok()
      : this.error({
          message: await resolveKey(message, languageKeys.preconditions.user.adminOnlyErrorMessage),
        })
  }
}
