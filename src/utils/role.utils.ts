import { Guild, GuildMember, Message, MessageEmbed, Role } from 'discord.js';
import { logger } from '../logger';
import { configuration } from '../config/configuration';
import { links } from './resources/links';
import { CommandoMessage } from 'discord.js-commando';

export default class RoleUtil {
  static roles = {
    ZOTE: {
      name: 'Zote',
      requiredPoints: 50,
      imageUrl:
        'https://i.pinimg.com/originals/ee/03/46/ee034690129e85474178822972cc9694.gif',
    },
    FALSE_KNIGHT: {
      name: 'False Knight',
      requiredPoints: 250,
      imageUrl: 'https://i.redd.it/glc4eegmj6g21.jpg',
    },
    HORNET: {
      name: 'Hornet',
      requiredPoints: 500,
      imageUrl:
        'https://thumbs.gfycat.com/SilverMellowHippopotamus-max-1mb.gif',
    },
    LOST_KIN: {
      name: 'Lost Kin',
      requiredPoints: 1000,
      imageUrl:
        'https://i.pinimg.com/originals/7f/ef/77/7fef776fab7c8e84fb0fe8923ac275ac.gif',
    },
    HIVE_KNIGHT: {
      name: 'Hive Knight',
      requiredPoints: 2000,
      imageUrl: 'https://i.imgur.com/GAurUyr.png',
    },
    SOUL_MASTER: {
      name: 'Soul Master',
      requiredPoints: 3000,
      imageUrl:
        'https://cs9.pikabu.ru/post_img/2017/05/14/8/1494769148116435151.gif',
    },
    WHITE_DEFENDER: {
      name: 'White Defender',
      requiredPoints: 5000,
      imageUrl:
        'https://static.wikia.nocookie.net/hollowknight/images/a/a7/B_White_Defender.png/revision/latest/scale-to-width-down/310?cb=20170803164634',
    },
    GREAT_NAILSAGE_SLY: {
      name: 'Great Nailsage Sly',
      requiredPoints: 8000,
      imageUrl:
        'https://thumbs.gfycat.com/DefinitiveScientificHerring-max-1mb.gif',
    },
    HOLLOW_KNIGHT: {
      name: 'Hollow Knight',
      requiredPoints: 12000,
      imageUrl:
        'https://i.pinimg.com/originals/0f/b6/67/0fb667fdaf03499eddff4829c14fa463.gif',
    },
    THE_KNIGHT: {
      name: 'The Knight',
      requiredPoints: 17000,
      imageUrl:
        'https://media1.tenor.com/images/e055198dce05b168933a08bed1c39145/tenor.gif',
    },
    NIGHTMARE_GRIMM: {
      name: 'Nightmare Grimm',
      requiredPoints: 23000,
      imageUrl:
        'https://i.pinimg.com/originals/cc/71/fc/cc71fc9af0932bee91a36ced6e9fcf93.gif',
    },
    PURE_VESSEL: {
      name: 'Pure Vessel',
      requiredPoints: 30000,
      imageUrl:
        'https://media1.tenor.com/images/cf6017c33f4a5a7f3e727d652ad93239/tenor.gif',
    },
    THE_ASCENDED_KNIGHT: {
      name: 'The Ascended Knight',
      requiredPoints: 50000,
      imageUrl:
        'https://thumbs.gfycat.com/FixedSmartJanenschia-size_restricted.gif',
    },
  };
  static ROLE_COLOR = configuration.embedMessageColor;

  static defineRoles(
    participationPoints: number,
    user: GuildMember,
    message: Message,
  ) {
    const botRoleExistingInUser = this.getRoleFromUser(user);
    const nextAvailableRole = this.getNextAvailableRoleOfUser(user);

    if (
      nextAvailableRole &&
      participationPoints >= nextAvailableRole.requiredPoints
    ) {
      // User accomplish requirements to gain a new role.
      const existingRoles = message.guild.roles.cache;
      const existingRoleInServer = existingRoles.find(
        (role) => role.name === nextAvailableRole.name,
      );
      // Role has to exist on the server to be applied.
      if (existingRoleInServer) {
        const haveRole = user.roles.cache.get(existingRoleInServer.id);
        if (!haveRole) {
          this.applyRole(
            existingRoleInServer,
            botRoleExistingInUser,
            user,
            message,
          );
        }
      }
    }
  }

  static getRoleFromUser(user: GuildMember): Role {
    const userRoles = user.roles.cache;

    const botRoleExistingInUser = userRoles.filter(
      (userRole) =>
        Object.values(this.roles).find(
          (role) => role.name === userRole.name,
        ) !== undefined,
    );

    return botRoleExistingInUser.first();
  }

  static getRole(
    discordRole: Role,
  ): { name: string; requiredPoints: number; imageUrl: string } {
    if (!discordRole) {
      return null;
    }
    const availableBotRoles = Object.values(this.roles);
    const role = availableBotRoles.find(
      (botRole) => botRole.name === discordRole.name,
    );
    return role;
  }

  static getNextAvailableRoleOfUser(
    user: GuildMember,
  ): { name: string; requiredPoints: number; imageUrl: string } {
    const currentRole = this.getRoleFromUser(user);

    if (!currentRole) {
      return this.roles.ZOTE;
    }

    if (currentRole.name === this.roles.THE_ASCENDED_KNIGHT.name) {
      return null;
    }

    const availableBotRoles = Object.values(this.roles);
    let nextAvailableRole = this.roles.ZOTE;
    availableBotRoles.some((role, idx) => {
      if (role.name === currentRole.name) {
        nextAvailableRole = availableBotRoles[idx + 1];
        return;
      }
    });

    return nextAvailableRole;
  }

  private static async applyRole(
    role: Role,
    previousRole: Role,
    user: GuildMember,
    message: Message,
  ) {
    try {
      if (previousRole) {
        await user.roles.remove(previousRole);
      }
      await user.roles.add(role);
      const embedMessage = new MessageEmbed()
        .setColor(this.ROLE_COLOR)
        .setImage(links.upgradeRole)
        .setDescription(
          `Congratulations ${user}, you have obtain the '${role.name}' role!`,
        );
      message.channel.send(embedMessage);
    } catch (error) {
      if (error.code === 50013) {
        const errMessage = `Failed '${role.name}' role assignation. I think I need more permissions ):`;
        logger.error(errMessage, { context: this.constructor.name });
        message.channel.send(errMessage);
      }
    }
  }

  static async initRoles(message: CommandoMessage): Promise<boolean> {
    try {
      const { guild } = message;
      const botRoles = Object.values(this.roles);
      botRoles.forEach(async (role) => {
        if (
          !guild.roles.cache.find((guildRole) => guildRole.name === role.name)
        ) {
          await guild.roles.create({
            data: {
              name: role.name,
              color: this.ROLE_COLOR,
              mentionable: true,
            },
          });
        }
      });
      return true;
    } catch (error) {
      logger.error(
        `Authorization error. Does not have enough permissions on '${message.guild.name}' server to create roles`,
        { context: this.constructor.name },
      );
    }
    return false;
  }

  static async removeRoles(guild: Guild): Promise<boolean> {
    try {
      const botRoles = Object.values(this.roles);
      botRoles.forEach(async (role) => {
        const existingRole = guild.roles.cache.find(
          (guildRole: Role) => guildRole.name === role.name,
        );
        if (existingRole) {
          await existingRole.delete('Bot fired from server');
        }
      });
      return true;
    } catch (error) {
      logger.error(
        `Authorization error. Does not have enough permissions on '${guild.name}' server to delete roles`,
        { context: this.constructor.name },
      );
    }
    return false;
  }
}
