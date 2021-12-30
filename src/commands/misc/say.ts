import type { Message } from 'discord.js'
import { Command, Args } from '@sapphire/framework'
import { languageKeys } from '@/utils'
import { fetchT } from '@sapphire/plugin-i18next'

/**
 * Replies the receives message on command.
 */
export class SayCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      aliases: ['s'],
      description: languageKeys.commands.misc.say.description,
    })
  }

  /**
   * It executes when someone types the "say" command.
   */
  async messageRun(message: Message, args: Args): Promise<Message<boolean>> {
    try {
      const text = await args.pick('string')
      await message.channel.send(text)
      return message.delete()
    } catch (error) {
      // If bot cannot delete messages.
    }
  }
}
