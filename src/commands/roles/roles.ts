import { Message, MessageEmbed } from 'discord.js'
import { Args, Command, CommandOptionsRunTypeEnum, container } from '@sapphire/framework'
import { configuration } from '@/config'
import { getRoleFromUser, roles, CustomPrecondition } from '@/utils'

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
      preconditions: [CustomPrecondition.RolesActiveOnly],
      runIn: [CommandOptionsRunTypeEnum.GuildAny],
    })
  }

  /**
   * It executes when someone types the "roles" command.
   */
  async messageRun(message: Message, args: Args): Promise<Message> {
    const { id: guildId } = message.guild

    const embedMessage = new MessageEmbed().setColor(configuration.embedMessageColor)

    const user = await args.pick('user').catch(() => null)
    if (!!user && !user.bot) {
      const guildUser = await message.guild.members.fetch(user.id)
      const currentRole = getRoleFromUser(guildUser)

      if (currentRole) {
        embedMessage.addField('Current Role', currentRole.name)
      } else {
        embedMessage.addField('Current Role', 'None')
      }

      embedMessage.setDescription(`:jack_o_lantern: ${user.username} :jack_o_lantern:`)

      let score = 'Who knows D:'
      try {
        const userDb = await container.db.userService.getById(user.id)
        const guildData = userDb.guildsData.find((guildData) => guildData.guildId === guildId)
        score = guildData.participationScore.toString()
      } catch (error) {}

      embedMessage.addField('Current Score', score)
    } else {
      embedMessage.setDescription(`:jack_o_lantern: Available ${configuration.appName}'s Roles :jack_o_lantern:`)

      let rolesList = ''
      let scoresList = ''
      const availableRoles = Object.values(roles)
      availableRoles.forEach((role) => {
        rolesList += `• ${role.name} \n`
        scoresList += `${role.requiredPoints} \n`
      })

      embedMessage.addField('Roles', rolesList, true)
      embedMessage.addField('Required scores', scoresList, true)
      embedMessage.setFooter('You can increase your score being participatory and interacting with other users n.n')
    }

    return message.channel.send({ embeds: [embedMessage] })
  }
}
