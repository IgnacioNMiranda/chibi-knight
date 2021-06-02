import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { logger } from '../../logger';
import Guild from '../../database/models/guild.model';
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
    const { id } = message.guild;
    const cachedGuild = app.cache.get(id);
    if (cachedGuild) {
      if (!cachedGuild.gameInstanceActive) {
        return message.say("There's no active game.");
      }
      cachedGuild.gameInstanceActive = false;
      app.cache.set(id, cachedGuild);
    }

    try {
      const guild = await app.guildService.getById(id);

      if (guild && !guild.gameInstanceActive) {
        return message.say("There's no active game.");
      }

      guild.gameInstanceActive = false;
      await guild.save();

      const { guildId, rolesActivated, gameInstanceActive } = guild;
      const cached: Guild = {
        guildId,
        rolesActivated,
        gameInstanceActive,
      };
      app.cache.set(guildId, cached);
      return message.say('Game cancelled.');
    } catch (error) {
      logger.error(
        `MongoDB Connection error. Could not change game instance state for '${message.guild.name}' server`,
        {
          context: this.constructor.name,
        },
      );
    }

    if (cachedGuild) {
      return message.say('Game cancelled.');
    } else {
      return message.say(
        'It occured an unexpected error :sweat: try again later.',
      );
    }
  }
}
