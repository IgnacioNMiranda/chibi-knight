import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { configuration } from '../../config/configuration';
import { RoleUtil } from '../../utils/index';
import { app } from '../../main';

/**
 * Displays information about the roles and score of an specific User.
 */
export default class MyRolesCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'myroles',
      aliases: ['mr'],
      group: 'roles',
      memberName: 'myroles',
      description: `Shows user's roles and their score.`,
      args: [],
    });
  }

  /**
   * It executes when someone types the "roles" command.
   */
  async run(message: CommandoMessage): Promise<Message> {
    const activatedRolesError = `${configuration.appName}'s roles are not activated. First, you have to run ${configuration.prefix}activateroles.`;

    const { id: guildId } = message.guild;
    const cachedGuild = app.cache.get(guildId);

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

    const {
      author: { id },
    } = message;
    const userRoles = message.guild.members.cache.find(
      (member) => member.id === id,
    ).roles.cache;

    let rolesList = '';
    let nextAvailableRole: { name: string; requiredPoints: number };
    const rolesArray = Object.values(RoleUtil.roles);
    rolesArray.forEach((role, idx) => {
      if (userRoles.find((userRole) => userRole.name === role.name)) {
        rolesList += `• ${role.name} \n`;
        if (idx != rolesArray.length - 1) {
          nextAvailableRole = rolesArray[idx + 1];
        }
      }
    });

    let score = 'Who knows D:';
    try {
      const user = await app.userService.getById(id);
      const guildData = user.guildsData.find(
        (guildData) => guildData.guildId === guildId,
      );
      score = guildData.participationScore.toString();
    } catch (error) {}

    const embedMessage = new MessageEmbed()
      .setColor(configuration.embedMessageColor)
      .setDescription(`${message.author.username}'s Roles`);

    if (rolesList) {
      embedMessage.addField('You have the following roles:', rolesList);
    } else {
      embedMessage.addField(
        `You don't have any role`,
        'Try to be more participatory n.n',
      );
    }

    embedMessage.addField('Current Score', score);

    if (nextAvailableRole) {
      if (nextAvailableRole.name !== rolesArray[rolesArray.length - 1].name) {
        embedMessage.setFooter(
          `You need ${
            nextAvailableRole.requiredPoints - parseInt(score)
          } points to get '${nextAvailableRole.name}' role.`,
        );
      } else {
        embedMessage.setFooter(
          `You are an ${
            rolesArray[rolesArray.length - 1].name
          }, you have reached supremacy!!`,
        );
      }
    } else {
      embedMessage.setFooter(
        `You need a total amount of ${
          rolesArray[0].requiredPoints - parseInt(score)
        } points to get '${rolesArray[0].name}' role.`,
      );
    }

    return message.say(embedMessage);
  }
}
