import {
  DMChannel,
  PartialDMChannel,
  NewsChannel,
  TextChannel,
  ThreadChannel,
} from 'discord.js'

export type BotChannel =
  | DMChannel
  | PartialDMChannel
  | NewsChannel
  | TextChannel
  | ThreadChannel
