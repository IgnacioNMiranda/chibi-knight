import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { GuildMember, Message } from 'discord.js';
import configuration from '../../config/configuration';
import logger from '../../logger';
import { Guild, User } from '../../database/models/index';
import { app } from '../../main';

/**
 * Initialize bot funcionalities setting cache and adding server to BD.
 */
export default class InitChibiKnightCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'initialize',
      aliases: ['i'],
      group: 'misc',
      memberName: 'initialize',
      description: 'Initialize Chibi Knight funcionalities.',
      hidden: true,
    });
  }

  /**
   * It executes when someone types the "initialize" command.
   */
  async run(message: CommandoMessage): Promise<Message> {
    try {
      const user: GuildMember = await message.guild.members.fetch(
        message.author.id,
      );
      if (!user.hasPermission('ADMINISTRATOR')) {
        return message.say(
          `You don't have permissions to run this command. Contact with an Administrator :sweat:`,
        );
      }

      const { id: guildId, members } = message.guild;
      const guild = await app.guildService.getById(guildId);
      if (!guild) {
        logger.info(
          `Trying to register new server '${message.guild.name}'...`,
          {
            context: this.constructor.name,
          },
        );

        const newGuild: Guild = { guildId };
        await app.guildService.create(newGuild);

        logger.info(`'${message.guild.name}' guild registered succesfully`, {
          context: this.constructor.name,
        });

        const guildMembers = await members.fetch();
        guildMembers.forEach(async ({ user }) => {
          if (!user.bot) {
            const bdUser = await app.userService.getById(user.id);
            if (bdUser) {
              if (!bdUser.guilds.find((id) => id === guildId)) {
                bdUser.guilds.push(guildId);
                await bdUser.save();
              }
            } else {
              const newUser: User = {
                discordId: user.id,
                name: user.username,
                guilds: [guildId],
              };
              await app.userService.create(newUser);
            }
          }
        });
        logger.info(
          `'${message.guild.name}' users has been registered succesfully`,
          {
            context: this.constructor.name,
          },
        );
        return message.say(
          `${configuration.appName} has been initialize successfully :purple_heart: check out the commands with ${configuration.prefix}help :smile:`,
        );
      } else {
        return message.say(
          `${configuration.appName} has already been initialize n.n`,
        );
      }
    } catch (error) {
      logger.error(error, { context: this.constructor.name });
      return message.say(
        `It occured an unexpected error while trying to initialize ${configuration.appName} :sweat: try again later.`,
      );
    }
  }
}
