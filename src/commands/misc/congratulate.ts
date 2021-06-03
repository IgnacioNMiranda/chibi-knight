import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, MessageEmbed, User } from 'discord.js';
import { links } from './resources/links';
import { configuration } from '../../config/configuration';

/**
 * Sends an embed message with congratulations to certain User and a celebration image.
 */
export default class CongratulateCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'congratulate',
      aliases: ['c'],
      group: 'misc',
      memberName: 'congratulate',
      description: 'Congratulates some @User.',
      args: [
        {
          key: 'congratulatedPerson',
          prompt: 'Who do you want to congratulate?',
          type: 'user',
        },
      ],
    });
  }

  /**
   * It executes when someone types the "congratulate" command.
   */
  async run(
    message: CommandoMessage,
    args: { congratulatedPerson: User },
  ): Promise<Message> {
    // Obtains the congratulation gif's urls.
    const gifs = links.congratulate.gifs;
    const randIndex = Math.floor(Math.random() * gifs.length);

    const embedMessage = new MessageEmbed()
      .setDescription(`Congratulations ${args.congratulatedPerson.username} !!`)
      .setColor(configuration.embedMessageColor)
      .setImage(gifs[randIndex]);

    try {
      await message.say(embedMessage);
      await message.delete();
    } catch (error) {
      // If bot cannot delete messages.
    }
    return;
  }
}
