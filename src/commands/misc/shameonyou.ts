import { Args, Command } from '@sapphire/framework'
import { Message, MessageEmbed } from 'discord.js'
import { configuration } from '@/config'
import { commandsLinks } from '@/utils'

/**
 * Sends an embed message disrespecting certain User and a disrespectful image.
 */
export class ShameOnYouCommand extends Command {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'shameonyou',
      aliases: ['soy'],
      fullCategory: ['misc'],
      description: 'Disrespects some @User.',
      runIn: ['GUILD_ANY'],
    })
  }

  /**
   * It executes when someone types the "shameonyou" command.
   */
  async messageRun(message: Message, args: Args): Promise<Message> {
    const disrespectedPerson = await args.pick('user')

    // Obtains disrespected gif's urls.
    const { gifs } = commandsLinks.misc.shameonyou
    const randIndex = Math.floor(Math.random() * gifs.length)

    const embedMessage = new MessageEmbed()
      .setDescription(`Shame on you! ${disrespectedPerson.username} !!`)
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
