import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { logger } from '../../logger';

/**
 * Replies the receives message on command.
 */
export default class SayCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'say',
      aliases: ['s'],
      group: 'misc',
      memberName: 'say',
      description: 'Replies with the received message.',
      args: [
        {
          key: 'receivedMessage',
          prompt: 'What text would you like the bot to say?',
          type: 'string',
        },
      ],
    });
  }

  /**
   * It executes when someone types the "say" command.
   */
  async run(message: CommandoMessage, args: any): Promise<Message> {
    try {
      await message.say(args.receivedMessage);
      await message.delete();
    } catch (error) {
      // If bot cannot delete messages.
      logger.error(error, {
        context: this.constructor.name,
      });
    }
    return;
  }
}
