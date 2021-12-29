import { Message, MessageEmbed } from 'discord.js'
import { Command, CommandOptionsRunTypeEnum, container } from '@sapphire/framework'
import { configuration } from '@/config'
import { logger, CustomPrecondition } from '@/utils'
import { User } from '@/database'

/**
 * Displays the tictactoe game leaderboard.
 */
export class TicTacToeLeaderBoardCommand extends Command {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'tttleaderboard',
      aliases: ['tttlb'],
      fullCategory: ['games'],
      description: 'Displays the tictactoe leaderboard.',
      preconditions: [CustomPrecondition.BotInitializeOnly],
      runIn: [CommandOptionsRunTypeEnum.GuildAny],
    })
  }

  /**
   * It executes when someone types the "tictactoeleaderboard" command.
   */
  async messageRun(message: Message): Promise<Message> {
    try {
      const { id: guildId } = message.guild
      const topUsers = await container.db.userService.getByNestedFilter(
        'guildsData',
        { 'guildsData.guildId': guildId },
        { 'guildsData.tictactoeWins': -1 }
      )

      const leaderboard = new MessageEmbed()
        .setTitle(`❌⭕ TicTacToe Leaderboard ❌⭕`)
        .setColor(configuration.embedMessageColor)
        .setDescription('Scoreboard of TicTacToe based on victories')

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
      leaderboard.addField('Positioning', usernamesList.join('\n'), true)
      leaderboard.addField('Victories', scoreList.join('\n'), true)

      return message.channel.send({ embeds: [leaderboard] })
    } catch (error) {
      logger.error(
        `MongoDB Connection error. Could not retrieve tictactoe leaderboard for '${message.guild.name}' server`,
        {
          context: this.constructor.name,
        }
      )
      return message.channel.send(`Sorry ): I couldn't retrieve tictactoe leaderboard. I failed you :sweat:`)
    }
  }
}
