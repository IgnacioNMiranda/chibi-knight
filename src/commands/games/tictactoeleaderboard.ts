import { getModelForClass, ReturnModelType } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import configuration from '../../config/configuration';
import DbUser from '../../database/models/user.model';
import logger from '../../logger';

/**
 * Displays the tictactoe game leaderboard.
 */
export default class TicTacToeLeaderBoardCommand extends Command {
  private readonly userRepository: ReturnModelType<typeof DbUser>;

  constructor(client: CommandoClient) {
    super(client, {
      name: 'tttleaderboard',
      aliases: ['tttlb'],
      group: 'games',
      memberName: 'tttleaderboard',
      description: 'Displays the tictactoe leaderboard.',
    });

    this.userRepository = getModelForClass(DbUser);
  }

  /**
   * It executes when someone types the "tictactoeleaderboard" command.
   */
  async run(message: CommandoMessage): Promise<Message> {
    try {
      await mongoose.connect(configuration.mongodb.connection_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      });

      const topUsers = await this.userRepository
        .find({
          tictactoeWins: { $exists: true },
        })
        .limit(10)
        .sort({ tictactoeWins: -1 })
        .exec();

      await mongoose.disconnect();

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
      logger.error(
        `MongoDB Connection error. Could not retrieve tictactoe leaderboard`,
        {
          context: this.constructor.name,
        },
      );
      logger.error(error, { context: this.constructor.name });
      return message.say(
        'Sorry ): Could not retrieve tictactoe leaderboard. I failed you :sweat:',
      );
    }
  }
}
