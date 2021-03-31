import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { app } from '../../main';
import configuration from '../../config/configuration';
import { roles } from '../../utils/roles.utils';
import { openMongoConnection } from '../../database/mongo';
import Server from '../../database/models/server.model';
import { ReturnModelType, getModelForClass } from '@typegoose/typegoose';

/**
 * Displays information about roles and their respective scores.
 */
export default class RolesCommand extends Command {
  private readonly serverRepository: ReturnModelType<typeof Server>;

  constructor(client: CommandoClient) {
    super(client, {
      name: 'roles',
      aliases: ['r'],
      group: 'roles',
      memberName: 'roles',
      description: `Shows every registered ${configuration.appName}'s roles`,
      args: [],
    });

    this.serverRepository = getModelForClass(Server);
  }

  /**
   * It executes when someone types the "roles" command.
   */
  async run(message: CommandoMessage): Promise<Message> {
    const activatedRolesError = `You have not activated ${configuration.appName}'s roles. First, you have to run ${configuration.prefix}activateroles.`;

    const cachedServer = app.cache.cache.get(message.guild.id);
    if (!cachedServer?.rolesActivated) {
      return message.say(activatedRolesError);
    }

    try {
      const mongoose = await openMongoConnection();
      const server = await this.serverRepository.findOne({
        guildId: message.guild.id,
      });
      mongoose.connection.close();
      if (server.rolesActivated) {
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
    const availableRoles = Object.values(roles);
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
