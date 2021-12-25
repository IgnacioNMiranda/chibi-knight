import { Command, container } from '@sapphire/framework'
import type { Message } from 'discord.js'
import { Guild } from '@/database'
import { logger } from '@/utils'

/**
 * Replies the receives message on command.
 */
export class CancelGameCommand extends Command {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      aliases: ['cg'],
      fullCategory: ['games'],
      description: 'Cancels the active game.',
    })
  }

  /**
   * It executes when someone types the "say" command.
   */
  async messageRun(message: Message): Promise<Message<boolean>> {
    if (message.guild === null) {
      return message.channel.send('You cannot cancel a game in a private chat.')
    }
    const { id } = message.guild
    const cachedGuild = container.cache.get(id)
    if (cachedGuild) {
      if (!cachedGuild.gameInstanceActive) {
        return message.channel.send("There's no active game.")
      }
      cachedGuild.gameInstanceActive = false
      container.cache.set(id, cachedGuild)
    }

    try {
      const guild = await container.db.guildService.getById(id)

      if (guild && !guild.gameInstanceActive) {
        return message.channel.send("There's no active game.")
      }

      guild.gameInstanceActive = false
      await guild.save()

      const { guildId, rolesActivated, gameInstanceActive } = guild
      const newCachedGuild: Guild = {
        guildId,
        rolesActivated,
        gameInstanceActive,
      }
      container.cache.set(guildId, newCachedGuild)
      return message.channel.send('Game cancelled.')
    } catch (error) {
      logger.error(
        `(${this.constructor.name}): MongoDB Connection error. Could not change game instance state for '${message.guild.name}' server`
      )
    }

    if (cachedGuild) {
      return message.channel.send('Game cancelled.')
    } else {
      return message.channel.send(
        'It occured an unexpected error :sweat: try again later.'
      )
    }
  }
}
