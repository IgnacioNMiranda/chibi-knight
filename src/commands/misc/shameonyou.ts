import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework'
import { Message, MessageEmbed } from 'discord.js'
import { configuration } from '@/config'
import { commandsLinks, languageKeys, CustomCommand, CustomArgs } from '@/utils'

/**
 * Sends an embed message disrespecting certain User and a disrespectful image.
 */
export class ShameOnYouCommand extends CustomCommand {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      aliases: ['soy'],
      description: languageKeys.commands.misc.shameonyou.description,
      runIn: [CommandOptionsRunTypeEnum.GuildAny],
    })
  }

  /**
   * It executes when someone types the "shameonyou" command.
   */
  async messageRun(message: Message, args: CustomArgs): Promise<Message> {
    const disrespectedPerson = await args.pick('user')

    // Obtains disrespected gif's urls.
    const { gifs } = commandsLinks.misc.shameonyou
    const randIndex = Math.floor(Math.random() * gifs.length)

    const embedMessage = new MessageEmbed()
      .setDescription(
        args.t(languageKeys.commands.misc.shameonyou.embedMessageDescription, { username: disrespectedPerson.username })
      )
      .setColor(configuration.client.embedMessageColor)
      .setImage(gifs[randIndex])

    try {
      await message.channel.send({ embeds: [embedMessage] })
      return message.delete()
    } catch (error) {
      // If bot cannot delete messages.
    }
  }
}
