import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { app } from '../../main';

/**
 * Replies the receives message on command.
 */
export default class CancelGameCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'cancelgame',
      aliases: ['cg'],
      group: 'games',
      memberName: 'cancelgame',
      description: 'Cancels the active game.',
      args: [],
    });
  }

  /**
   * It executes when someone types the "say" command.
   */
  async run(message: CommandoMessage): Promise<Message> {
    if (app.gameInstanceActive) {
      app.gameInstanceActive = false;
      await message.say('Game cancelled.');
    } else {
      await message.say("There's no active game.");
    }
    return;
  }
}
