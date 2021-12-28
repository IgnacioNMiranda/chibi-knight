import { container, Precondition } from '@sapphire/framework'
import { Message } from 'discord.js'
import { configuration } from '@/config'

export class BotNotInitializeOnlyPrecondition extends Precondition {
  public async run(message: Message) {
    const { id: guildId } = message.guild
    const guild = await container.db.guildService.getById(guildId)

    return !guild
      ? this.ok()
      : this.error({
          message: `${configuration.appName} has already been initialize n.n`,
        })
  }
}
