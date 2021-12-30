import { Command, container } from '@sapphire/framework'
import { Message } from 'discord.js'
import { configuration } from '@/config'
import { logger, CustomPrecondition, languageKeys, CustomCommand, CustomArgs } from '@/utils'
import { Guild, User, GuildData } from '@/database'

/**
 * Initialize bot funcionalities setting cache and adding server to BD.
 */
export class InitChibiKnightCommand extends CustomCommand {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      aliases: ['i'],
      description: languageKeys.commands.misc.init.description,
      preconditions: [CustomPrecondition.AdminOnly, CustomPrecondition.BotNotInitializeOnly],
      requiredUserPermissions: ['ADMINISTRATOR'],
    })
  }

  /**
   * It executes when someone types the "init" command.
   */
  async messageRun(message: Message, { t }: CustomArgs): Promise<Message> {
    const { id: guildId, members } = message.guild

    logger.info(`Trying to register new server '${message.guild.name}'...`, {
      context: this.constructor.name,
    })

    const newGuild: Guild = { guildId }
    const { appName, prefix } = configuration
    try {
      await container.db.guildService.create(newGuild)

      logger.info(`'${message.guild.name}' guild registered succesfully`, {
        context: this.constructor.name,
      })

      const guildMembers = await members.fetch()
      guildMembers.forEach(async ({ user }) => {
        if (!user.bot) {
          const guildData: GuildData = { guildId }
          const bdUser = await container.db.userService.getById(user.id)
          if (bdUser) {
            if (!bdUser.guildsData.find((guildData) => guildData.guildId === guildId)) {
              bdUser.guildsData.push(guildData)
              await bdUser.save()
            }
          } else {
            const newUser: User = {
              discordId: user.id,
              name: user.username,
              guildsData: [guildData],
            }
            await container.db.userService.create(newUser)
          }
        }
      })
      logger.info(`'${message.guild.name}' users has been registered succesfully`, {
        context: this.constructor.name,
      })

      return message.channel.send(t(languageKeys.commands.misc.init.initSuccessfullyEvent, { appName, prefix }))
    } catch (error) {
      logger.error(error, { context: this.constructor.name })
      return message.channel.send(t(languageKeys.commands.misc.init.initSuccessfullyEvent, { appName }))
    }
  }
}
