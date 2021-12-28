import { Args, Command } from '@sapphire/framework'
import { Message, MessageEmbed } from 'discord.js'
import { configuration } from '@/config'
import { commandsLinks } from '@/utils'

/**
 * Sends an embed message with congratulations to certain User and a celebration image.
 */
export class CongratulateCommand extends Command {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      aliases: ['c'],
      fullCategory: ['misc'],
      description: 'Congratulates some @User.',
      runIn: ['GUILD_ANY'],
    })
  }

  /**
   * It executes when someone types the "congratulate" command.
   */
  async messageRun(message: Message, args: Args): Promise<Message> {
    const congratulatedPerson = await args.pick('user')
    // Obtains the congratulation gif's urls.
    const { gifs } = commandsLinks.misc.congratulate
    const randIndex = Math.floor(Math.random() * gifs.length)

    const embedMessage = new MessageEmbed()
      .setDescription(`Congratulations ${congratulatedPerson.username} !!`)
      .setColor(configuration.embedMessageColor)
      .setImage(gifs[randIndex])

    try {
      await message.channel.send({ embeds: [embedMessage] })
      return message.delete()
    } catch (error) {
      // If bot cannot delete messages.
    }
  }
}
