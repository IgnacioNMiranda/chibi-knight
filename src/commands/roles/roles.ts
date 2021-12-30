import { Message, MessageEmbed } from 'discord.js'
import { Command, CommandOptionsRunTypeEnum, container } from '@sapphire/framework'
import { configuration } from '@/config'
import { getRoleFromUser, roles, CustomPrecondition, CustomCommand, CustomArgs, languageKeys } from '@/utils'

/**
 * Displays information about roles and their respective scores.
 */
export class RolesCommand extends CustomCommand {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      aliases: ['r'],
      description: languageKeys.commands.roles.roles.description,
      preconditions: [CustomPrecondition.RolesActivatedOnly],
      runIn: [CommandOptionsRunTypeEnum.GuildAny],
    })
  }

  /**
   * It executes when someone types the "roles" command.
   */
  async messageRun(message: Message, args: CustomArgs): Promise<Message> {
    const { id: guildId } = message.guild

    const embedMessage = new MessageEmbed().setColor(configuration.embedMessageColor)

    const user = await args.pick('user').catch(() => null)
    if (!!user && !user.bot) {
      const guildUser = await message.guild.members.fetch(user.id)
      const currentRole = getRoleFromUser(guildUser)

      const {
        currentRoleTitle,
        noCurrentRoleText,
        userRolesMessageDescription,
        currentScoreTitle,
        currentScoreText,
        undefinedScoreText,
      } = languageKeys.commands.roles.roles

      if (currentRole) {
        embedMessage.addField(args.t(currentRoleTitle), currentRole.name)
      } else {
        embedMessage.addField(args.t(currentRoleTitle), args.t(noCurrentRoleText))
      }

      embedMessage.setDescription(args.t(userRolesMessageDescription, { username: user.username }))

      let score: number
      try {
        const userDb = await container.db.userService.getById(user.id)
        const guildData = userDb.guildsData.find((guildData) => guildData.guildId === guildId)
        score = guildData.participationScore
      } catch (error) {}

      const hasScore = score && score >= 0
      embedMessage.addField(
        args.t(currentScoreTitle),
        args.t(currentScoreText, { points: hasScore ? score.toString() : args.t(undefinedScoreText) })
      )
    } else {
      const { everyRoleMessageDescription, rolesTitle, requiredScoresTitle, messageFooter } =
        languageKeys.commands.roles.roles
      embedMessage.setDescription(args.t(everyRoleMessageDescription, { appName: configuration.appName }))

      let rolesList = ''
      let scoresList = ''
      const availableRoles = Object.values(roles)
      availableRoles.forEach((role) => {
        rolesList += `• ${role.name} \n`
        scoresList += `${role.requiredPoints} \n`
      })

      embedMessage.addField(args.t(rolesTitle), rolesList, true)
      embedMessage.addField(args.t(requiredScoresTitle), scoresList, true)
      embedMessage.setFooter(args.t(messageFooter))
    }

    return message.channel.send({ embeds: [embedMessage] })
  }
}
