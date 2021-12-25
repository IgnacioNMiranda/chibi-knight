import { Command, container } from '@sapphire/framework'
import { GuildMember, Message } from 'discord.js'
import { configuration } from '@/config'
import { logger } from '@/utils'
import { Guild, User, GuildData } from '@/database'

/**
 * Initialize bot funcionalities setting cache and adding server to BD.
 */
export class InitChibiKnightCommand extends Command {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'init',
      aliases: ['i'],
      fullCategory: ['misc'],
      description: 'Initialize Chibi Knight funcionalities.',
    })
  }

  /**
   * It executes when someone types the "init" command.
   */
  async messageRun(message: Message): Promise<Message> {
    if (!message.guild) {
      return message.channel.send(
        `You cannot initialize my features in a DM channel.`
      )
    }

    try {
      const user: GuildMember = await message.guild.members.fetch(
        message.author.id
      )
      if (!user.permissions.has('ADMINISTRATOR')) {
        return message.channel.send(
          `You don't have permissions to run this command. Contact with an Administrator :sweat:`
        )
      }

      const { id: guildId, members } = message.guild
      const guild = await container.db.guildService.getById(guildId)
      if (guild) {
        return message.channel.send(
          `${configuration.appName} has already been initialize n.n`
        )
      }

      logger.info(`Trying to register new server '${message.guild.name}'...`, {
        context: this.constructor.name,
      })

      const newGuild: Guild = { guildId }
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
            if (
              !bdUser.guildsData.find(
                (guildData) => guildData.guildId === guildId
              )
            ) {
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
      logger.info(
        `'${message.guild.name}' users has been registered succesfully`,
        {
          context: this.constructor.name,
        }
      )
      return message.channel.send(
        `${configuration.appName} has been initialize successfully :purple_heart: check out the commands with **${configuration.prefix}help** :smile:`
      )
    } catch (error) {
      logger.error(error, { context: this.constructor.name })
      return message.channel.send(
        `It occured an unexpected error while trying to initialize ${configuration.appName} :sweat: try again later.`
      )
    }
  }
}
