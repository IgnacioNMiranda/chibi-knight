import { Guild, GuildMember, Message, MessageEmbed, Role } from 'discord.js'
import { logger } from './logger'
import { configuration } from '@/config'
import { CommandoMessage } from 'discord.js-commando'
import { utilLinks } from './links'
import { BotRoles } from '.'

export const roles: Record<
  BotRoles,
  { name: string; requiredPoints: number; imageUrl: string }
> = {
  [BotRoles.ZOTE]: {
    name: 'Zote',
    requiredPoints: 50,
    imageUrl:
      'https://i.pinimg.com/originals/ee/03/46/ee034690129e85474178822972cc9694.gif',
  },
  [BotRoles.FALSE_KNIGHT]: {
    name: 'False Knight',
    requiredPoints: 250,
    imageUrl:
      'https://64.media.tumblr.com/356b8e0e7dee00acc039604288194b3c/tumblr_px601eoSrB1wv5hmyo3_400.gif',
  },
  [BotRoles.HORNET]: {
    name: 'Hornet',
    requiredPoints: 500,
    imageUrl: 'https://thumbs.gfycat.com/SilverMellowHippopotamus-max-1mb.gif',
  },
  [BotRoles.LOST_KIN]: {
    name: 'Lost Kin',
    requiredPoints: 1000,
    imageUrl:
      'https://i.pinimg.com/originals/7f/ef/77/7fef776fab7c8e84fb0fe8923ac275ac.gif',
  },
  [BotRoles.HIVE_KNIGHT]: {
    name: 'Hive Knight',
    requiredPoints: 2000,
    imageUrl:
      'https://64.media.tumblr.com/a3fe65707da54f7b94fa2ef73300ad0e/tumblr_phxzts4UTK1wv5hmyo2_400.gif',
  },
  [BotRoles.SOUL_MASTER]: {
    name: 'Soul Master',
    requiredPoints: 3000,
    imageUrl:
      'https://cs9.pikabu.ru/post_img/2017/05/14/8/1494769148116435151.gif',
  },
  [BotRoles.WHITE_DEFENDER]: {
    name: 'White Defender',
    requiredPoints: 5000,
    imageUrl:
      'https://64.media.tumblr.com/10cbee955cdc5787510ac0556832d6f8/tumblr_phxzts4UTK1wv5hmyo7_400.gif',
  },
  [BotRoles.GREAT_NAILSAGE_SLY]: {
    name: 'Great Nailsage Sly',
    requiredPoints: 8000,
    imageUrl:
      'https://thumbs.gfycat.com/DefinitiveScientificHerring-max-1mb.gif',
  },
  [BotRoles.HOLLOW_KNIGHT]: {
    name: 'Hollow Knight',
    requiredPoints: 12000,
    imageUrl:
      'https://i.pinimg.com/originals/0f/b6/67/0fb667fdaf03499eddff4829c14fa463.gif',
  },
  [BotRoles.THE_KNIGHT]: {
    name: 'The Knight',
    requiredPoints: 17000,
    imageUrl:
      'https://media1.tenor.com/images/e055198dce05b168933a08bed1c39145/tenor.gif',
  },
  [BotRoles.NIGHTMARE_GRIMM]: {
    name: 'Nightmare Grimm',
    requiredPoints: 23000,
    imageUrl:
      'https://i.pinimg.com/originals/cc/71/fc/cc71fc9af0932bee91a36ced6e9fcf93.gif',
  },
  [BotRoles.PURE_VESSEL]: {
    name: 'Pure Vessel',
    requiredPoints: 30000,
    imageUrl:
      'https://media1.tenor.com/images/cf6017c33f4a5a7f3e727d652ad93239/tenor.gif',
  },
  [BotRoles.THE_ASCENDED_KNIGHT]: {
    name: 'The Ascended Knight',
    requiredPoints: 50000,
    imageUrl:
      'https://thumbs.gfycat.com/FixedSmartJanenschia-size_restricted.gif',
  },
}

export const ROLE_COLOR = configuration.embedMessageColor
export const CONTEXT = 'RoleUtil'

export const defineRoles = (
  participationPoints: number,
  user: GuildMember,
  message: Message
) => {
  const nextAvailableRole = getNextAvailableRoleOfUser(user)

  if (
    nextAvailableRole &&
    participationPoints >= nextAvailableRole.requiredPoints
  ) {
    // User accomplish requirements to gain a new role.
    const existingRoles = message.guild.roles.cache
    const existingRoleInServer = existingRoles.find(
      (role) => role.name === nextAvailableRole.name
    )
    // Role has to exist on the server to be applied.
    if (existingRoleInServer) {
      const botRoleExistingInUser = getRoleFromUser(user)
      const haveRole = user.roles.cache.get(existingRoleInServer.id)
      if (!haveRole) {
        applyRole(existingRoleInServer, botRoleExistingInUser, user, message)
      }
    }
  }
}

export const getRoleFromUser = (user: GuildMember): Role => {
  const userRoles = user.roles.cache

  const botRoleExistingInUser = userRoles.filter(
    (userRole) =>
      Object.values(roles).find((role) => role.name === userRole.name) !==
      undefined
  )

  return botRoleExistingInUser.first()
}

export const getRole = (
  discordRole: Role
): {
  name: string
  requiredPoints: number
  imageUrl: string
} => {
  if (!discordRole) {
    return null
  }
  const availableBotRoles = Object.values(roles)
  const role = availableBotRoles.find(
    (botRole) => botRole.name === discordRole.name
  )
  return role
}

export const getNextAvailableRoleOfUser = (
  user: GuildMember
): {
  name: string
  requiredPoints: number
  imageUrl: string
} => {
  const currentRole = getRoleFromUser(user)

  if (!currentRole) {
    return roles.zote
  }

  if (currentRole.name === roles['the-ascended-knight'].name) {
    return null
  }

  const availableBotRoles = Object.values(roles)
  let nextAvailableRole = roles.zote
  availableBotRoles.forEach((role, idx) => {
    if (role.name === currentRole.name) {
      nextAvailableRole = availableBotRoles[idx + 1]
    }
  })

  return nextAvailableRole
}

export const applyRole = async (
  role: Role,
  previousRole: Role,
  user: GuildMember,
  message: Message
) => {
  try {
    if (previousRole) {
      await user.roles.remove(previousRole)
    }
    await user.roles.add(role)
    const embedMessage = new MessageEmbed()
      .setColor(ROLE_COLOR)
      .setImage(utilLinks.roles.upgradeRole)
      .setDescription(
        `Congratulations ${user}, you have obtain the '${role.name}' role!`
      )
    message.channel.send(embedMessage)
  } catch (error) {
    if (error.code === 50013) {
      const errMessage = `Failed '${role.name}' role assignation. I think I need more permissions ):`
      logger.error(errMessage, { context: CONTEXT })
      message.channel.send(errMessage)
    }
  }
}

export const initRoles = async (message: CommandoMessage): Promise<boolean> => {
  try {
    const { guild } = message
    const botRoles = Object.values(roles)
    const rolesBuilder = botRoles.map(async (role) => {
      if (
        !guild.roles.cache.find((guildRole) => guildRole.name === role.name)
      ) {
        return guild.roles.create({
          data: {
            name: role.name,
            color: ROLE_COLOR,
            mentionable: true,
          },
        })
      }
    })
    await Promise.all(rolesBuilder)
    return true
  } catch (error) {
    logger.error(
      `Authorization error. Does not have enough permissions on '${message.guild.name}' server to create roles`,
      { context: CONTEXT }
    )
  }
  return false
}

export const removeRoles = async (guild: Guild): Promise<boolean> => {
  try {
    const botRoles = Object.values(roles)
    botRoles.forEach(async (role) => {
      const existingRole = guild.roles.cache.find(
        (guildRole: Role) => guildRole.name === role.name
      )
      if (existingRole) {
        await existingRole.delete('Bot fired from server')
      }
    })
    return true
  } catch (error) {
    logger.error(
      `Authorization error. Does not have enough permissions on '${guild.name}' server to delete roles`,
      { context: CONTEXT }
    )
  }
  return false
}
