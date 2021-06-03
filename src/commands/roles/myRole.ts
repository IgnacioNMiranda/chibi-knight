import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { configuration } from '../../config/configuration';
import { RoleUtil } from '../../utils/index';
import { app } from '../../main';

/**
 * Displays information about the role and score of an specific User.
 */
export default class MyRoleCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'myrole',
      aliases: ['mr'],
      group: 'roles',
      memberName: 'myrole',
      description: `Shows user's role and their score.`,
      args: [],
    });
  }

  /**
   * It executes when someone types the "roles" command.
   */
  async run(message: CommandoMessage): Promise<Message> {
    if (!message.guild) {
      return message.say(`You don't have roles here.`);
    }

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
    const user = message.guild.members.cache.find((member) => member.id === id);

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
      .setDescription(`${message.author.username}'s Role`);

    const discordRole = RoleUtil.getRoleFromUser(user);
    const currentRole = RoleUtil.getRole(discordRole);
    const nextAvailableRole = RoleUtil.getNextAvailableRoleOfUser(user);
    if (
      (nextAvailableRole &&
        nextAvailableRole.name !== RoleUtil.roles.ZOTE.name) ||
      !nextAvailableRole
    ) {
      embedMessage.addField(
        'You have the following role:',
        `• ${currentRole.name}`,
      );
      embedMessage.setImage(currentRole.imageUrl);
    } else {
      embedMessage.addField(
        `You don't have any role`,
        'Try to be more participatory n.n',
      );
    }

    embedMessage.addField('Current Score', score);
    if (nextAvailableRole) {
      embedMessage.setFooter(
        `You need ${
          nextAvailableRole.requiredPoints - parseInt(score)
        } more points to get '${nextAvailableRole.name}' role.`,
      );
    } else {
      embedMessage.setFooter(
        `You are ${currentRole.name}, you have reached the absolute supremacy!!`,
      );
    }

    return message.say(embedMessage);
  }
}
