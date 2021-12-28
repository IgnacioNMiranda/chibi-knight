import { CacheType, Message, MessageComponentInteraction } from 'discord.js'
import { BotCommandsCategories } from '.'

export type RoleLinks = 'upgradeRole' | 'noRole'

export interface UtilsLinks {
  [BotCommandsCategories.ROLES]: Record<RoleLinks, string>
}

export enum BotRoles {
  ZOTE = 'zote',
  FALSE_KNIGHT = 'false-knight',
  HORNET = 'hornet',
  LOST_KIN = 'lost-kin',
  HIVE_KNIGHT = 'hive-knight',
  SOUL_MASTER = 'soul-master',
  WHITE_DEFENDER = 'white-defender',
  GREAT_NAILSAGE_SLY = 'great-nailsage-sly',
  HOLLOW_KNIGHT = 'hollow-knight',
  THE_KNIGHT = 'the-knight',
  NIGHTMARE_GRIMM = 'nightmare-grimm',
  PURE_VESSEL = 'pure-vessel',
  THE_ASCENDED_KNIGHT = 'the-ascended-knight',
}

export enum RolesButtonId {
  ACCEPT = 'roles-accept',
  REJECT = 'roles-reject',
}

export type ActivateRolesResolverParams = {
  message: Message
  interaction?: MessageComponentInteraction<CacheType>
}
