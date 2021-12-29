import { Precondition } from '@sapphire/framework'
import { GuildMember, Message } from 'discord.js'

export class AdminOnlyPrecondition extends Precondition {
  public async run(message: Message) {
    const user: GuildMember = await message.guild.members.fetch(message.author.id)

    return user.permissions.has('ADMINISTRATOR')
      ? this.ok()
      : this.error({
          message: `You don't have permissions to run this command. Contact with an Administrator :sweat:`,
        })
  }
}
