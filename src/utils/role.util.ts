import { Guild, GuildMember, Message, MessageEmbed, Role } from 'discord.js'
import { logger } from './logger'
import { configuration } from '@/config'
import { utilLinks } from './links'
import { languageKeys, roles } from '.'
import { resolveKey } from '@sapphire/plugin-i18next'

const ROLE_COLOR = configuration.embedMessageColor
const CONTEXT = 'RoleUtil'

export const defineRoles = (participationPoints: number, user: GuildMember, message: Message) => {
  const nextAvailableRole = getNextAvailableRoleFromUser(user)

  if (nextAvailableRole && participationPoints >= nextAvailableRole.requiredPoints) {
    // User accomplish requirements to gain a new role.
    const existingRoles = message.guild.roles.cache
    const existingRoleInServer = existingRoles.find((role) => role.name === nextAvailableRole.name)
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
    (userRole) => Object.values(roles).find((role) => role.name === userRole.name) !== undefined
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
  const role = availableBotRoles.find((botRole) => botRole.name === discordRole.name)
  return role
}

export const getNextAvailableRoleFromUser = (
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

export const applyRole = async (role: Role, previousRole: Role, user: GuildMember, message: Message) => {
  try {
    if (previousRole) {
      await user.roles.remove(previousRole)
    }
    await user.roles.add(role)
    const getNewRoleMsg = await resolveKey(message, languageKeys.rolesAssignment.userObtainsNewRole, {
      username: user.user.username,
      roleName: role.name,
    })
    const embedMessage = new MessageEmbed()
      .setColor(ROLE_COLOR)
      .setImage(utilLinks.roles.upgradeRole)
      .setDescription(getNewRoleMsg)
    message.channel.send({ embeds: [embedMessage] })
  } catch (error) {
    if (error.code === 50013) {
      const errMessage = await resolveKey(message, languageKeys.rolesAssignment.newRoleAssignmentError, {
        roleName: role.name,
      })
      logger.error(errMessage, { context: CONTEXT })
      message.channel.send(errMessage)
    }
  }
}

export const initRoles = async (message: Message): Promise<boolean> => {
  try {
    const { guild } = message
    const botRoles = Object.values(roles)
    const rolesBuilder = botRoles.map(async (role) => {
      if (!guild.roles.cache.find((guildRole) => guildRole.name === role.name)) {
        return guild.roles.create({
          name: role.name,
          color: ROLE_COLOR,
          mentionable: true,
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
    const rolesRemover = botRoles.map(async (role) => {
      const existingRole = guild.roles.cache.find((guildRole: Role) => guildRole.name === role.name)
      if (existingRole) {
        return existingRole.delete('Bot fired from server')
      }
    })
    await Promise.all(rolesRemover)
    return true
  } catch (error) {
    logger.error(`Authorization error. Does not have enough permissions on '${guild.name}' server to delete roles`, {
      context: CONTEXT,
    })
  }
  return false
}
