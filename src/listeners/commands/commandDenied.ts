import type { UserError, CommandDeniedPayload } from '@sapphire/framework'
import { Listener } from '@sapphire/framework'

export class CommandDeniedListener extends Listener {
  public run(error: UserError, { message }: CommandDeniedPayload) {
    return message.channel.send(error.message)
  }
}
