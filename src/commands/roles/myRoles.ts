import { ReturnModelType, getModelForClass } from '@typegoose/typegoose';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { openMongoConnection } from '../../database/mongo';
import configuration from '../../config/configuration';
import { roles } from '../../utils/roles.utils';
import DbUser from '../../database/models/user.model';
import { app } from '../../main';
import Server from '../../database/models/server.model';

/**
 * Displays information about the roles and score of an specific User.
 */
export default class MyRolesCommand extends Command {
  private readonly userRepository: ReturnModelType<typeof DbUser>;
  private readonly serverRepository: ReturnModelType<typeof Server>;

  constructor(client: CommandoClient) {
    super(client, {
      name: 'myroles',
      aliases: ['mr'],
      group: 'roles',
      memberName: 'myroles',
      description: `Shows user's roles and their score.`,
      args: [],
    });

    this.userRepository = getModelForClass(DbUser);
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
      await mongoose.connection.close();
      if (server?.rolesActivated) {
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
    const rolesArray = Object.values(roles);
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
      const mongoose = await openMongoConnection();
      const user = await this.userRepository.findOne({ discordId: id });
      await mongoose.connection.close();

      score = user.participationScore.toString();
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
