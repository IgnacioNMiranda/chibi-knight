import { Message, MessageEmbed, User } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { app } from '../../main';
import { configuration } from '../../config/configuration';
import { RoleUtil } from '../../utils/index';

/**
 * Displays information about roles and their respective scores.
 */
export default class RolesCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'roles',
      aliases: ['r'],
      group: 'roles',
      memberName: 'roles',
      description: `Shows every registered ${configuration.appName}'s roles`,
      args: [
        {
          key: 'user',
          prompt: 'Do you wanna see roles from who?',
          type: 'user',
          default: 'null',
        },
      ],
    });
  }

  /**
   * It executes when someone types the "roles" command.
   */
  async run(message: CommandoMessage, args: { user?: User }): Promise<Message> {
    const activatedRolesError = `${configuration.appName}'s roles are not activated. First, you have to run ${configuration.prefix}activateroles.`;

    let guildId: string;
    if (message.guild) {
      guildId = message.guild.id;
      const cachedGuild = app.cache.get(guildId);

      if (cachedGuild && !cachedGuild.rolesActivated) {
        return message.say(activatedRolesError);
      } else {
        try {
          const guild = await app.guildService.getById(guildId);
          if (guild && !guild.rolesActivated) {
            return message.say(activatedRolesError);
          }
        } catch (error) {
          return message.say(
            'It occured an unexpected error :sweat: try again later.',
          );
        }
      }
    }

    const embedMessage = new MessageEmbed().setColor(
      configuration.embedMessageColor,
    );

    const { user } = args;
    if (((user as unknown) as string) != 'null' && !user.bot) {
      if (!message.guild) {
        return message.say(
          `I cannot show you the ${user}'s role because we are not chatting in a Guild.`,
        );
      }
      const guildUser = await message.guild.members.fetch(user.id);
      const currentRole = RoleUtil.getRoleFromUser(guildUser);

      if (currentRole) {
        embedMessage.addField('Current Role', currentRole.name);
      } else {
        embedMessage.addField('Current Role', 'None');
      }

      embedMessage.setDescription(
        `:jack_o_lantern: ${user.username} :jack_o_lantern:`,
      );

      let score = 'Who knows D:';
      try {
        const userDb = await app.userService.getById(user.id);
        const guildData = userDb.guildsData.find(
          (guildData) => guildData.guildId === guildId,
        );
        score = guildData.participationScore.toString();
      } catch (error) {}

      embedMessage.addField('Current Score', score);
    } else {
      embedMessage.setDescription(
        `:jack_o_lantern: Available ${configuration.appName}'s Roles :jack_o_lantern:`,
      );

      let rolesList = '';
      let scoresList = '';
      const availableRoles = Object.values(RoleUtil.roles);
      availableRoles.forEach((role) => {
        rolesList += `• ${role.name} \n`;
        scoresList += `${role.requiredPoints} \n`;
      });

      embedMessage.addField('Roles', rolesList, true);
      embedMessage.addField('Required scores', scoresList, true);
      embedMessage.setFooter(
        'You can increase your score being participatory and interacting with other users n.n',
      );
    }

    return message.say(embedMessage);
  }
}
