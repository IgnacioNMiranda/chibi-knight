import type { Message } from 'discord.js'
import { Command } from '@sapphire/framework'
import { languageKeys, CustomCommand, CustomArgs } from '@/utils'

/**
 * Replies the receives message on command.
 */
export class SayCommand extends CustomCommand {
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
  async messageRun(message: Message, args: CustomArgs): Promise<Message<boolean>> {
    try {
      const text = await args.pick('string')
      await message.channel.send(text)
      return message.delete()
    } catch (error) {
      // If bot cannot delete messages.
    }
  }
}
