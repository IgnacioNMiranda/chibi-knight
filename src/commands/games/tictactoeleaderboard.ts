import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { app } from '../../main';
import configuration from '../../config/configuration';
import logger from '../../logger';

/**
 * Displays the tictactoe game leaderboard.
 */
export default class TicTacToeLeaderBoardCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'tttleaderboard',
      aliases: ['tttlb'],
      group: 'games',
      memberName: 'tttleaderboard',
      description: 'Displays the tictactoe leaderboard.',
    });
  }

  /**
   * It executes when someone types the "tictactoeleaderboard" command.
   */
  async run(message: CommandoMessage): Promise<Message> {
    try {
      const topUsers = await app.userService.getByFilter(
        {
          tictactoeWins: { $exists: true },
          guilds: message.guild.id,
        },
        10,
        { tictactoeWins: -1 },
      );

      const leaderboard = new MessageEmbed()
        .setTitle(`❌⭕ TicTacToe Leaderboard ❌⭕`)
        .setColor(configuration.embedMessageColor)
        .setDescription('Scoreboard of TicTacToe based on victories');

      const usernamesList = [];
      const scoreList = [];
      let position = 1;
      topUsers.forEach((user) => {
        let trophy: string;
        switch (position) {
          case 1:
            trophy = ':first_place:';
            break;
          case 2:
            trophy = ':second_place:';
            break;
          case 3:
            trophy = ':third_place:';
            break;
        }
        usernamesList.push(`${trophy ? trophy : ' '} ${user.name}`);
        scoreList.push(user.tictactoeWins);
        position += 1;
      });
      leaderboard.addField('Positioning', usernamesList, true);
      leaderboard.addField('Victories', scoreList, true);

      return message.embed(leaderboard);
    } catch (error) {
      logger.error(error);
      logger.error(
        `MongoDB Connection error. Could not retrieve tictactoe leaderboard for '${message.guild.name}' server`,
        {
          context: this.constructor.name,
        },
      );
      return message.say(
        `Sorry ): I couldn't retrieve tictactoe leaderboard. I failed you :sweat:`,
      );
    }
  }
}
