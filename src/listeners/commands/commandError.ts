import { Listener, Events, ArgumentError, UserError, CommandErrorPayload } from '@sapphire/framework'
import { configuration } from '@/config'
import { resolveKey } from '@sapphire/plugin-i18next'
import { languageKeys } from '@/utils'

export class UserListener extends Listener<typeof Events.CommandError> {
  public async run(error: Error, { message, command }: CommandErrorPayload) {
    let helperMessage: string

    if (error instanceof ArgumentError)
      helperMessage = await resolveKey(message, languageKeys.listeners.commands.argumentErrorMessage)
    else if (error instanceof UserError)
      helperMessage = await resolveKey(message, languageKeys.listeners.commands.userErrorMessage)
    else helperMessage = await resolveKey(message, languageKeys.listeners.commands.fallbackErrorMessage)

    helperMessage += await resolveKey(message, languageKeys.listeners.commands.helperMessageExtension, {
      prefix: configuration.client.defaultPrefix,
      commandName: command.name,
    })
    return message.channel.send(helperMessage)
  }
}
