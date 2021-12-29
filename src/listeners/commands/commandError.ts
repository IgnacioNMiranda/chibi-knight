import { Listener, Events, CommandErrorPayload, ArgumentError, UserError } from '@sapphire/framework'
import { configuration } from '@/config'

export class UserListener extends Listener<typeof Events.CommandError> {
  public async run(error: Error, { message, command }: CommandErrorPayload) {
    let helperMessage: string

    if (error instanceof ArgumentError) helperMessage = `That argument is not valid!`
    else if (error instanceof UserError) helperMessage = 'You need to write more parameters!'
    else helperMessage = 'You need to write more parameters!'

    helperMessage += `\n> **Tip**: You can do \`${configuration.prefix}help ${command.name}\` to find out how to use this command.`
    return message.channel.send(helperMessage)
  }
}
