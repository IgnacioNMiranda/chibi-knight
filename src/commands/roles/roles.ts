import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { app } from '../../main';
import configuration from '../../config/configuration';
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
      args: [],
    });
  }

  /**
   * It executes when someone types the "roles" command.
   */
  async run(message: CommandoMessage): Promise<Message> {
    const activatedRolesError = `${configuration.appName}'s roles are not activated. First, you have to run ${configuration.prefix}activateroles.`;

    const { id: guildId } = message.guild;
    const cachedGuild = app.cache.getGuildById(guildId);

    if (cachedGuild && !cachedGuild.rolesActivated) {
      return message.say(activatedRolesError);
    }

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

    const embedMessage = new MessageEmbed()
      .setColor(configuration.embedMessageColor)
      .setDescription(
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

    return message.say(embedMessage);
  }
}
