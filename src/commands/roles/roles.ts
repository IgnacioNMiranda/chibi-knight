import { Message, MessageEmbed, User } from 'discord.js'
import { Args, Command, container } from '@sapphire/framework'
import { configuration } from '@/config'
import { getRoleFromUser, roles } from '@/utils'

/**
 * Displays information about roles and their respective scores.
 */
export class RolesCommand extends Command {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'roles',
      aliases: ['r'],
      fullCategory: ['roles'],
      description: `Shows every registered ${configuration.appName}'s roles or specific @User's role.`,
    })
  }

  /**
   * It executes when someone types the "roles" command.
   */
  async messageRun(message: Message, args: Args): Promise<Message> {
    const activatedRolesError = `${configuration.appName}'s roles are not activated. First, you have to run \`${configuration.prefix}activateroles\``

    let guildId: string
    if (message.guild) {
      guildId = message.guild.id
      const cachedGuild = container.cache.get(guildId)

      if (cachedGuild && !cachedGuild.rolesActivated) {
        return message.channel.send(activatedRolesError)
      } else {
        try {
          const guild = await container.db.guildService.getById(guildId)
          if (guild && !guild.rolesActivated) {
            return message.channel.send(activatedRolesError)
          }
        } catch (error) {
          return message.channel.send(
            'It occured an unexpected error :sweat: try again later.'
          )
        }
      }
    }

    const embedMessage = new MessageEmbed().setColor(
      configuration.embedMessageColor
    )

    const user = await args.pick('user').catch(() => null)
    if (!!user && !user.bot) {
      if (!message.guild) {
        return message.channel.send(
          `I cannot show you the ${user}'s role because we are not chatting in a Guild.`
        )
      }
      const guildUser = await message.guild.members.fetch(user.id)
      const currentRole = getRoleFromUser(guildUser)

      if (currentRole) {
        embedMessage.addField('Current Role', currentRole.name)
      } else {
        embedMessage.addField('Current Role', 'None')
      }

      embedMessage.setDescription(
        `:jack_o_lantern: ${user.username} :jack_o_lantern:`
      )

      let score = 'Who knows D:'
      try {
        const userDb = await container.db.userService.getById(user.id)
        const guildData = userDb.guildsData.find(
          (guildData) => guildData.guildId === guildId
        )
        score = guildData.participationScore.toString()
      } catch (error) {}

      embedMessage.addField('Current Score', score)
    } else {
      embedMessage.setDescription(
        `:jack_o_lantern: Available ${configuration.appName}'s Roles :jack_o_lantern:`
      )

      let rolesList = ''
      let scoresList = ''
      const availableRoles = Object.values(roles)
      availableRoles.forEach((role) => {
        rolesList += `• ${role.name} \n`
        scoresList += `${role.requiredPoints} \n`
      })

      embedMessage.addField('Roles', rolesList, true)
      embedMessage.addField('Required scores', scoresList, true)
      embedMessage.setFooter(
        'You can increase your score being participatory and interacting with other users n.n'
      )
    }

    return message.channel.send({ embeds: [embedMessage] })
  }
}
