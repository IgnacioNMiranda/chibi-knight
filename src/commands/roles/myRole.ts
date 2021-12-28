import { Message, MessageEmbed } from 'discord.js'
import { Command, container } from '@sapphire/framework'
import { configuration } from '@/config'
import {
  getNextAvailableRoleFromUser,
  getRole,
  getRoleFromUser,
  roles,
  utilLinks,
} from '@/utils'

/**
 * Displays information about the role and score of an specific User.
 */
export class MyRoleCommand extends Command {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'myrole',
      aliases: ['mr'],
      fullCategory: ['roles'],
      description: `Shows user's role and their score.`,
      preconditions: ['RolesActiveOnly'],
      runIn: ['GUILD_ANY'],
    })
  }

  /**
   * It executes when someone types the "roles" command.
   */
  async messageRun(message: Message): Promise<Message> {
    const { id: guildId } = message.guild
    const {
      author: { id },
    } = message
    const user = message.guild.members.cache.find((member) => member.id === id)

    let score = 'Who knows D:'
    try {
      const user = await container.db.userService.getById(id)
      const guildData = user.guildsData.find(
        (guildData) => guildData.guildId === guildId
      )
      score = guildData.participationScore.toString()
    } catch (error) {}

    const embedMessage = new MessageEmbed()
      .setColor(configuration.embedMessageColor)
      .setDescription(`${message.author.username}'s Role`)

    const discordRole = getRoleFromUser(user)
    const currentBotRelatedRole = getRole(discordRole)
    const nextAvailableRole = getNextAvailableRoleFromUser(user)
    if (
      (nextAvailableRole && nextAvailableRole.name !== roles.zote.name) ||
      !nextAvailableRole
    ) {
      embedMessage.addField(
        'You have the following role:',
        `• ${currentBotRelatedRole.name}`
      )
      embedMessage.setImage(currentBotRelatedRole.imageUrl)
    } else {
      embedMessage.addField(
        `You don't have any role`,
        'Try to be more participatory n.n'
      )
      embedMessage.setImage(utilLinks.roles.noRole)
    }

    embedMessage.addField('Current Score', score)
    if (nextAvailableRole) {
      embedMessage.setFooter(
        `You need ${
          nextAvailableRole.requiredPoints - parseInt(score)
        } more points to get '${nextAvailableRole.name}' role.`
      )
    } else {
      embedMessage.setFooter(
        `You are ${currentBotRelatedRole.name}, you have reached the absolute supremacy!!`
      )
    }

    return message.channel.send({ embeds: [embedMessage] })
  }
}
