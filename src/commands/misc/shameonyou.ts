import { Args, Command, CommandOptionsRunTypeEnum } from '@sapphire/framework'
import { Message, MessageEmbed } from 'discord.js'
import { configuration } from '@/config'
import { commandsLinks, languageKeys } from '@/utils'
import { resolveKey } from '@sapphire/plugin-i18next'

/**
 * Sends an embed message disrespecting certain User and a disrespectful image.
 */
export class ShameOnYouCommand extends Command {
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
  async messageRun(message: Message, args: Args): Promise<Message> {
    const disrespectedPerson = await args.pick('user')

    // Obtains disrespected gif's urls.
    const { gifs } = commandsLinks.misc.shameonyou
    const randIndex = Math.floor(Math.random() * gifs.length)

    const embedMessageDescription = await resolveKey(
      message,
      languageKeys.commands.misc.shameonyou.embedMessageDescription,
      { username: disrespectedPerson.username }
    )

    const embedMessage = new MessageEmbed()
      .setDescription(embedMessageDescription)
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
