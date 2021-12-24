import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando'
import { Message, MessageEmbed, User } from 'discord.js'
import { configuration } from '@/config'
import { commandsLinks } from '@/utils'

/**
 * Sends an embed message disrespecting certain User and a disrespectful image.
 */
export default class ShameOnYouCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'shameonyou',
      aliases: ['soy'],
      group: 'misc',
      memberName: 'shameonyou',
      description: 'Disrespects some @User.',
      args: [
        {
          key: 'disrespectedPerson',
          prompt: 'Who do you want to disrespect?',
          type: 'user',
        },
      ],
    })
  }

  /**
   * It executes when someone types the "shameonyou" command.
   */
  async run(
    message: CommandoMessage,
    args: { disrespectedPerson: User }
  ): Promise<Message> {
    // Obtains disrespected gif's urls.
    const { gifs } = commandsLinks.misc.shameonyou
    const randIndex = Math.floor(Math.random() * gifs.length)

    const embedMessage = new MessageEmbed()
      .setDescription(`Shame on you! ${args.disrespectedPerson.username} !!`)
      .setColor(configuration.embedMessageColor)
      .setImage(gifs[randIndex])

    try {
      await message.say(embedMessage)
      return message.delete()
    } catch (error) {
      // If bot cannot delete messages.
    }
  }
}
