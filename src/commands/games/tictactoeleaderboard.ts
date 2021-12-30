import { Message, MessageEmbed } from 'discord.js'
import { Command, CommandOptionsRunTypeEnum, container } from '@sapphire/framework'
import { configuration } from '@/config'
import { logger, CustomPrecondition, languageKeys, CustomCommand, CustomArgs } from '@/utils'
import { User } from '@/database'

/**
 * Displays the tictactoe game leaderboard.
 */
export class TicTacToeLeaderBoardCommand extends CustomCommand {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'tttleaderboard',
      aliases: ['tttlb'],
      description: languageKeys.commands.games.tictactoeleaderboard.description,
      preconditions: [CustomPrecondition.BotInitializedOnly],
      runIn: [CommandOptionsRunTypeEnum.GuildAny],
    })
  }

  /**
   * It executes when someone types the "tictactoeleaderboard" command.
   */
  async messageRun(message: Message, { t }: CustomArgs): Promise<Message> {
    const { messageTitle, messageDescription, positioningLabel, victoriesLabel, errorMessage } =
      languageKeys.commands.games.tictactoeleaderboard

    try {
      const { id: guildId } = message.guild
      const topUsers = await container.db.userService.getByNestedFilter(
        'guildsData',
        { 'guildsData.guildId': guildId },
        { 'guildsData.tictactoeWins': -1 }
      )

      const leaderboard = new MessageEmbed()
        .setTitle(t(messageTitle))
        .setColor(configuration.client.embedMessageColor)
        .setDescription(t(messageDescription))

      const usernamesList: string[] = []
      const scoreList = []
      let position = 1
      topUsers.forEach((user: User) => {
        const { guildsData }: any = user
        let trophy: string
        switch (position) {
          case 1:
            trophy = ':first_place:'
            break
          case 2:
            trophy = ':second_place:'
            break
          case 3:
            trophy = ':third_place:'
            break
        }
        usernamesList.push(`${trophy || ' '} ${user.name}`)
        scoreList.push(guildsData.tictactoeWins)
        position += 1
      })

      leaderboard.addField(t(positioningLabel), usernamesList.join('\n'), true)
      leaderboard.addField(t(victoriesLabel), scoreList.join('\n'), true)

      return message.channel.send({ embeds: [leaderboard] })
    } catch (error) {
      logger.error(
        `MongoDB Connection error. Could not retrieve tictactoe leaderboard for '${message.guild.name}' server`,
        {
          context: this.constructor.name,
        }
      )
      return message.channel.send(t(errorMessage))
    }
  }
}
