import { Message, MessageEmbed } from 'discord.js'
import { Command, CommandOptionsRunTypeEnum, container } from '@sapphire/framework'
import { configuration } from '@/config'
import {
  getNextAvailableRoleFromUser,
  getRole,
  getRoleFromUser,
  roles,
  utilLinks,
  CustomPrecondition,
  languageKeys,
  CustomCommand,
  CustomArgs,
} from '@/utils'

/**
 * Displays information about the role and score of an specific User.
 */
export class MyRoleCommand extends CustomCommand {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      aliases: ['mr'],
      description: languageKeys.commands.roles.myrole.description,
      preconditions: [CustomPrecondition.RolesActiveOnly],
      runIn: [CommandOptionsRunTypeEnum.GuildAny],
    })
  }

  /**
   * It executes when someone types the "roles" command.
   */
  async messageRun(message: Message, { t }: CustomArgs): Promise<Message> {
    const { id: guildId } = message.guild
    const {
      author: { id },
    } = message
    const user = message.guild.members.cache.find((member) => member.id === id)

    let score: number
    try {
      const user = await container.db.userService.getById(id)
      const guildData = user.guildsData.find((guildData) => guildData.guildId === guildId)
      score = guildData.participationScore
    } catch (error) {}

    const {
      embedMessageDescription,
      followingRoleTitle,
      noHaveRoleTitle,
      noHaveRoleText,
      currentScoreTitle,
      currentScoreText,
      undefinedScoreText,
      messageFooter,
      messageFooterMaxPoints,
    } = languageKeys.commands.roles.myrole

    const embedMessage = new MessageEmbed()
      .setColor(configuration.embedMessageColor)
      .setDescription(t(embedMessageDescription, { username: message.author.username }))

    const discordRole = getRoleFromUser(user)
    const currentBotRelatedRole = getRole(discordRole)
    const nextAvailableRole = getNextAvailableRoleFromUser(user)
    if ((nextAvailableRole && nextAvailableRole.name !== roles.zote.name) || !nextAvailableRole) {
      embedMessage.addField(t(followingRoleTitle), `• ${currentBotRelatedRole.name}`)
      embedMessage.setImage(currentBotRelatedRole.imageUrl)
    } else {
      embedMessage.addField(t(noHaveRoleTitle), t(noHaveRoleText))
      embedMessage.setImage(utilLinks.roles.noRole)
    }

    const hasScore = score && score >= 0

    embedMessage.addField(
      t(currentScoreTitle),
      t(currentScoreText, { points: hasScore ? score.toString() : t(undefinedScoreText) })
    )
    if (nextAvailableRole) {
      embedMessage.setFooter(
        t(messageFooter, {
          points: hasScore ? nextAvailableRole.requiredPoints - score : 'some',
          role: nextAvailableRole.name,
        })
      )
    } else {
      embedMessage.setFooter(t(messageFooterMaxPoints, { maxRole: currentBotRelatedRole.name }))
    }

    return message.channel.send({ embeds: [embedMessage] })
  }
}
