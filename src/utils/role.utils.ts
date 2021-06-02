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
    },
    FALSE_KNIGHT: {
      name: 'False Knight',
      requiredPoints: 250,
    },
    HORNET: {
      name: 'Hornet',
      requiredPoints: 500,
    },
    LOST_KIN: {
      name: 'Lost Kin',
      requiredPoints: 1000,
    },
    HIVE_KNIGHT: {
      name: 'Hive Knight',
      requiredPoints: 2000,
    },
    SOUL_MASTER: {
      name: 'Soul Master',
      requiredPoints: 3000,
    },
    WHITE_DEFENDER: {
      name: 'White Defender',
      requiredPoints: 5000,
    },
    GREAT_NAILSAGE_SLY: {
      name: 'Great Nailsage Sly',
      requiredPoints: 8000,
    },
    HOLLOW_KNIGHT: {
      name: 'Hollow Knight',
      requiredPoints: 12000,
    },
    THE_KNIGHT: {
      name: 'The Knight',
      requiredPoints: 17000,
    },
    NIGHTMARE_GRIMM: {
      name: 'Nightmare Grimm',
      requiredPoints: 23000,
    },
    PURE_VESSEL: {
      name: 'Pure Vessel',
      requiredPoints: 30000,
    },
    THE_ASCENDED_KNIGHT: {
      name: 'The Ascended Knight',
      requiredPoints: 50000,
    },
  };
  static ROLE_COLOR = configuration.embedMessageColor;

  static defineRoles(
    participationPoints: number,
    user: GuildMember,
    message: Message,
  ) {
    const userRoles = message.guild.members.cache.find(
      (member) => member.id === message.author.id,
    ).roles.cache;
    const availableBotRoles = Object.values(this.roles);
    const botRolesExistingInUser = userRoles.filter(
      (userRole) =>
        availableBotRoles.find((role) => role.name === userRole.name) !==
        undefined,
    );

    // User has an unlockable role.
    let nextAvailableRole: { name: string; requiredPoints: number } = this.roles
      .ZOTE;
    availableBotRoles.forEach((role, idx) => {
      if (
        botRolesExistingInUser.find((botRole) => botRole.name === role.name)
      ) {
        nextAvailableRole = availableBotRoles[idx + 1];
      }
    });

    // User accomplish requirements to gain a new role.
    if (
      nextAvailableRole &&
      participationPoints >= nextAvailableRole.requiredPoints
    ) {
      const existingRoles = message.guild.roles.cache;
      const existingRoleInServer = existingRoles.find(
        (role) => role.name === nextAvailableRole.name,
      );
      // Role has to exist on the server to be applied.
      if (existingRoleInServer) {
        const haveRole = user.roles.cache.get(existingRoleInServer.id);
        if (!haveRole) {
          this.applyRole(existingRoleInServer, user, message);
        }
      }
    }
  }

  private static async applyRole(
    role: Role,
    user: GuildMember,
    message: Message,
  ) {
    try {
      if (!user.roles.cache.get(role.id)) {
        await user.roles.add(role);
        const embedMessage = new MessageEmbed()
          .setColor(this.ROLE_COLOR)
          .setImage(links.upgradeRole)
          .setDescription(
            `Congratulations ${user}, you have obtain the '${role.name}' role!`,
          );
        message.channel.send(embedMessage);
      }
    } catch (error) {
      const errMessage = `Failed '${role.name}' role assignation. I think I need more permissions ):`;
      logger.error(errMessage, { context: this.constructor.name });
      message.channel.send(errMessage);
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
