import { Command, CommandOptionsRunTypeEnum, container } from '@sapphire/framework'
import type { Message } from 'discord.js'
import { logger, CustomPrecondition, languageKeys, CustomCommand, CustomArgs } from '@/utils'

/**
 * Replies the receives message on command.
 */
export class CancelGameCommand extends CustomCommand {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      aliases: ['cg'],
      description: languageKeys.commands.games.cancelgame.description,
      preconditions: [CustomPrecondition.BotInitializeOnly],
      runIn: [CommandOptionsRunTypeEnum.GuildAny],
    })
  }

  /**
   * It executes when someone types the "say" command.
   */
  async messageRun(message: Message, { t }: CustomArgs): Promise<Message<boolean>> {
    const { id } = message.guild

    try {
      const guild = await container.db.guildService.getById(id)

      if (guild && !guild.gameInstanceActive) {
        return message.channel.send(t(languageKeys.commands.games.cancelgame.noActiveGame))
      }

      guild.gameInstanceActive = false
      await guild.save()
      return message.channel.send(t(languageKeys.commands.games.cancelgame.gameCancelled))
    } catch (error) {
      logger.error(
        `(${this.constructor.name}): MongoDB Connection error. Could not change game instance state for '${message.guild.name}' server`
      )
    }

    return message.channel.send(t(languageKeys.errors.unexpectedError))
  }
}
