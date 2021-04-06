import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { MessageEmbed, User, Message } from 'discord.js';
import { QandA } from './resources/QandA';
import { app } from '../../main';
import configuration from '../../config/configuration';
import logger from '../../logger';
import { DocumentType } from '@typegoose/typegoose';
import DbUser from '../../database/models/user.model';
import { links } from './resources/links';
import { RoleUtil } from '../../utils/index';
import { Guild } from '../../database/models/index';
import GuildData from '../../database/models/guildData.model';

/**
 * Starts a tic-tac-toe game.
 */
export default class TicTacToeCommand extends Command {
  defaultSymbol: string;
  tictactoeBoard: string[];

  constructor(client: CommandoClient) {
    super(client, {
      name: 'tictactoe',
      aliases: ['ttt'],
      group: 'games',
      memberName: 'tictactoe',
      description: 'Initiates a tictactoe game.',
      args: [
        {
          key: 'player2',
          prompt: 'Who do you want to challenge?',
          type: 'user',
        },
      ],
    });

    // Default symbol of the board.
    this.defaultSymbol = ':purple_square:';
  }

  /**
   * It executes when someone types the "tictactoe" command.
   */
  async run(
    message: CommandoMessage,
    args: { player2: User },
  ): Promise<Message> {
    // Obtains the challenging player instance.
    const { author: player1 } = message;
    const { player2 } = args;

    let gameInstanceActive: boolean;
    try {
      gameInstanceActive = await app.cache.getGameInstanceActive(message);
    } catch (error) {
      return message.say(
        'Error ): could not start game. Try again later :sweat:',
      );
    }

    // If there's already a game in course or a player challenged Chibi Knight or themself, the game cannot be executed.
    if (gameInstanceActive) {
      return message.say(`There's already a game in course ${player1}!`);
    } else if (player1.id === player2.id) {
      return message.say('You cannot challenge yourself ¬¬ ...');
    } else if (player2.bot) {
      return message.say(
        "You cannot challenge me :anger: I'm a superior being... I would destroy you n.n :purple_heart:",
      );
    }

    const QandAGames = QandA[0]; // Obtains object with games answers.
    const filter = (response: any) => {
      return QandAGames.answers.some(
        (answer: string) =>
          answer === response.content && response.author.id === player2.id,
      );
    };

    await message.say(
      `${player2} has been challenged by ${player1} to play #. Do you accept the challenge? (yes/y/no/n)`,
    );

    // Waits 15 seconds while player2 types a valid answer (yes/y/no/n).
    const collectedMessages = await message.channel.awaitMessages(filter, {
      max: 1,
      time: 15000,
    });

    if (collectedMessages?.first()) {
      const receivedMsg = collectedMessages.first().content;
      if (receivedMsg === 'no' || receivedMsg === 'n') {
        await message.say(
          `Game cancelled ): Come back when you are brave enough, ${player2}.`,
        );
      } else if (receivedMsg === 'yes' || receivedMsg === 'y') {
        try {
          const { id } = message.guild;
          const guild = await app.guildService.getById(id);
          guild.gameInstanceActive = true;
          await guild.save();

          const cachedGuild = app.cache.getGuildById(id);
          if (cachedGuild) {
            cachedGuild.gameInstanceActive = true;
            app.cache.setGuildById(id, cachedGuild);
          } else {
            const { guildId, rolesActivated, gameInstanceActive } = guild;
            const cached: Guild = {
              guildId,
              rolesActivated,
              gameInstanceActive,
            };
            app.cache.setGuildById(guildId, cached);
          }

          this.ticTacToeInstance(message, player1, player2, QandAGames);
        } catch (error) {
          logger.error(
            `MongoDB Connection error. Could not register change game instance active state for ${message.guild.name}`,
            {
              context: this.constructor.name,
            },
          );
          return message.say(
            'Error ): could not start game. Try again later :purple_heart:',
          );
        }
      }
    } else {
      return message.say(`Time's up! ${player2.username} dont want to play ):`);
    }
  }

  /**
   * Manages the tictactoe game and its properties.
   */
  async ticTacToeInstance(
    message: CommandoMessage,
    player1: User,
    player2: User,
    QandAGames: {
      category: string;
      answers: string[];
      ticTacToePositions: any;
    },
  ) {
    this.tictactoeBoard = [
      this.defaultSymbol,
      this.defaultSymbol,
      this.defaultSymbol,
      this.defaultSymbol,
      this.defaultSymbol,
      this.defaultSymbol,
      this.defaultSymbol,
      this.defaultSymbol,
      this.defaultSymbol,
    ];
    const { id: guildId } = message.guild;

    const random = Math.random() < 0.5;
    let activePlayer = random ? player1 : player2;
    let otherPlayer = random ? player2 : player1;

    const embedMessage = this.embedDefaultTicTacToeBoard(player1, player2)
      .addField(
        'Instructions',
        'Type the number where you want to make your move.',
        false,
      )
      .addField('Current turn', `It's your turn ${activePlayer.username}`);

    const sentEmbedMessage = await message.embed(embedMessage);
    const collector = message.channel.createMessageCollector(
      (receivedMsg: Message) => {
        if (receivedMsg.author.bot) {
          return false;
        }

        // if the receivedMsg is the cancel game command, passes the filter for later collector ends.
        const possibleCancelledGame = receivedMsg.content
          .split(' ')[0]
          .split(configuration.prefix)[1];
        if (
          possibleCancelledGame === 'cancelgame' ||
          possibleCancelledGame === 'cg'
        ) {
          collector.stop('Cancel game command executed.');
        }

        // Checks if the played position is valid.
        const playedPosition = receivedMsg.content;
        const validPlay =
          QandAGames.ticTacToePositions.some(
            (position: number) => position === parseInt(playedPosition),
          ) && this.tictactoeBoard[playedPosition] === this.defaultSymbol;
        return receivedMsg.author.id === activePlayer.id && validPlay;
      },
      { max: 9 },
    );

    collector.on('collect', async (m: CommandoMessage) => {
      const playedNumber = m.content;
      try {
        // Deletes the message with the player's move.
        await m.delete();
      } catch (error) {}

      // If player1 made a move, the mark is ❌. If it was player2, the mark is a ⭕.
      activePlayer.id == player1.id
        ? (this.tictactoeBoard[playedNumber] = ':x:')
        : (this.tictactoeBoard[playedNumber] = ':o:');

      // Change the play turn.
      const auxPlayer = activePlayer;
      activePlayer = otherPlayer;
      otherPlayer = auxPlayer;

      // Creates the new embed message with the new mark.
      const newEmbedMessage = this.embedDefaultTicTacToeBoard(player1, player2);

      // Obtains the current state of the game.
      const gameState = this.obtainGameState(parseInt(playedNumber));

      if (gameState != -1) {
        // Game was tied or a player won.
        let result: string;
        let stopReason: string;
        let winner: User;
        let loser: User;
        switch (gameState) {
          case 0:
            result = 'The game was a tie! :confetti_ball: Thanks for play (:';
            stopReason = `Tictactoe game between ${player1.username} and ${player2.username} ends!`;
            break;
          case 1:
            result = `:tada: CONGRATULATIONS ${player1}! You have won! :tada:`;
            stopReason = `${player1.username} won on TicTacToe against ${player2.username}!`;
            winner = player1;
            loser = player2;
            break;
          case 2:
            result = `:tada: CONGRATULATIONS ${player2}! You have won! :tada:`;
            stopReason = `${player2.username} won on TicTacToe against ${player1.username}!`;
            winner = player2;
            loser = player1;
            break;
        }

        if (winner) {
          try {
            logger.info(
              `Registering ${winner.username}'s tictactoe victory...`,
              {
                context: this.constructor.name,
              },
            );

            const score = 10;
            let finalScore = score;
            const user: DocumentType<DbUser> = await app.userService.getById(
              winner.id,
            );
            if (user) {
              const guildDataIdx = user.guildsData.findIndex(
                (guildData) => guildData.guildId === guildId,
              );
              user.guildsData[guildDataIdx].participationScore += score;
              user.guildsData[guildDataIdx].tictactoeWins += 1;
              finalScore = user.guildsData[guildDataIdx].participationScore;
              await user.save();
            } else {
              const guildData: GuildData = {
                guildId,
                participationScore: score,
              };
              const newUser: DbUser = {
                discordId: winner.id,
                name: winner.username,
                guildsData: [guildData],
              };
              await app.userService.create(newUser);
            }

            const authorGuildMember = await message.guild.members.fetch(
              winner.id,
            );
            RoleUtil.defineRoles(finalScore, authorGuildMember, message);
            logger.info('Victory registered successfully', {
              context: this.constructor.name,
            });
          } catch (error) {
            logger.error(
              `MongoDB Connection error. Could not register ${winner.username}'s tictactoe victory`,
              {
                context: this.constructor.name,
              },
            );
          }
        }

        newEmbedMessage.addField('Result :trophy:', result, false);
        if (winner && loser) {
          newEmbedMessage.addField(
            'Consolation prize :second_place:',
            `Don't worry ${loser}, this is for you:`,
          );
          newEmbedMessage.setImage(links.tictactoe.gifs[0]);
        }

        /* sentEmbedMessage.channel.messages.fetch({limit: 5})
                    .then(messagesCollection => {
                        if (!messagesCollection.some(msg => msg == sentEmbedMessage)) {
                            sentEmbedMessage = new MessageEmbed(newEmbedMessage);
                            message.say(sentEmbedMessage);
                        } else {
                            // Edits the embed tictactoe message.
                            sentEmbedMessage.edit(newEmbedMessage);
                        }
                    }); */

        // Edits the embed tictactoe message.
        await sentEmbedMessage.edit(newEmbedMessage);

        // Stop message recollection.
        collector.stop(stopReason);
      } else {
        newEmbedMessage
          .addField(
            'Instructions',
            'Type the number where you want to make your move.',
            false,
          )
          .addField(
            'Current turn',
            `It's your turn ${activePlayer.username}`,
            false,
          );

        /* sentEmbedMessage.channel.messages.fetch({limit: 5})
                    .then(messagesCollection => {
                        if (!messagesCollection.some(msg => msg == sentEmbedMessage)) {
                            sentEmbedMessage = new MessageEmbed(newEmbedMessage);
                            message.say(sentEmbedMessage);
                        } else {
                            // Edits the embed tictactoe message.
                            sentEmbedMessage.edit(newEmbedMessage);
                        }
                    }); */

        // Edits the embed tictactoe message.
        await sentEmbedMessage.edit(newEmbedMessage);
      }
    });

    collector.on('end', async (collected: any, reason: any) => {
      // Unlocks the game instance.
      try {
        const guild = await app.guildService.getById(guildId);
        guild.gameInstanceActive = false;
        await guild.save();
      } catch (error) {
        logger.error(
          `MongoDB Connection error. Could not change game instance active for ${message.guild.name} server`,
          {
            context: this.constructor.name,
          },
        );
      }

      const cachedGuild = app.cache.getGuildById(guildId);
      if (cachedGuild) {
        cachedGuild.gameInstanceActive = false;
        app.cache.setGuildById(guildId, cachedGuild);
      }

      logger.info(reason, {
        context: this.constructor.name,
      });
    });
  }

  /**
   * Creates a generic tictactoe board.
   */
  embedDefaultTicTacToeBoard(player1: User, player2: User): MessageEmbed {
    return new MessageEmbed()
      .setTitle(`:x::o: Gato:3 :x::o:`)
      .setColor(configuration.embedMessageColor)
      .setDescription(
        'Tres en raya | Michi | Triqui | Gato | Cuadritos | Tictactoe | Whatever',
      )
      .addField(
        'Challengers',
        `${player1.username} V/S ${player2.username}`,
        false,
      )
      .addField(
        'Board',
        `
        ${this.tictactoeBoard[0]}${this.tictactoeBoard[1]}${this.tictactoeBoard[2]}
        ${this.tictactoeBoard[3]}${this.tictactoeBoard[4]}${this.tictactoeBoard[5]}
        ${this.tictactoeBoard[6]}${this.tictactoeBoard[7]}${this.tictactoeBoard[8]}
        `,
        true,
      )
      .addField(
        'Positions reference',
        `
        :zero::one::two:
        :three::four::five:
        :six::seven::eight:
        `,
        true,
      );
  }

  /**
   * It resolves if the game is a tie or if someone has won.
   * (-1) : No one has won yet.
   * (0) : Tied.
   * (1) : Player 1 won.
   * (2) : Player 2 won.
   */
  obtainGameState(playedNumber: number): number {
    let Xcounter = 0;
    let Ocounter = 0;

    let initialRowPosition = -1;
    // Depending of the played number, we have to check certain row.
    if (playedNumber >= 0 && playedNumber <= 2) initialRowPosition = 0;
    else if (playedNumber >= 3 && playedNumber <= 5) initialRowPosition = 3;
    else initialRowPosition = 6;

    // Checks for played row.
    for (let i = initialRowPosition; i < initialRowPosition + 3; i++) {
      if (this.tictactoeBoard[i] == this.defaultSymbol) {
        // If there's no :x: or :o: on a row slot, it cannot be a winning row.
        break;
      }

      if (this.tictactoeBoard[i] == ':x:') Xcounter++;
      else Ocounter++;

      // If the entire row was checked.
      if (i + 1 == initialRowPosition + 3) {
        // If a row is completed marked with :x: or :o: its a winning play.
        if (Xcounter == 3) return 1;
        else if (Ocounter == 3) return 2;
      }
    }

    // Reset counters.
    Xcounter = 0;
    Ocounter = 0;

    let initialColPosition = -1;
    // Depending of the played number, we have to check certain column.
    if (playedNumber == 0 || playedNumber == 3 || playedNumber == 6)
      initialColPosition = 0;
    else if (playedNumber == 1 || playedNumber == 4 || playedNumber == 7)
      initialColPosition = 1;
    else initialColPosition = 2;

    // Checks for played column.
    for (let i = initialColPosition; i < 9; i += 3) {
      if (this.tictactoeBoard[i] == this.defaultSymbol) {
        // If there's no :x: or :o: on a column slot, it cannot be a winning column.
        break;
      }

      if (this.tictactoeBoard[i] == ':x:') Xcounter++;
      else Ocounter++;

      // If the entire column was checked.
      if (i == 6 || i == 7 || i == 8) {
        // If a column is completed marked with :x: or :o: its a winning play.
        if (Xcounter == 3) return 1;
        else if (Ocounter == 3) return 2;
      }
    }

    // Reset counters.
    Xcounter = 0;
    Ocounter = 0;

    // Check for left diagonal.
    for (let i = 0; i < 9; i += 4) {
      if (this.tictactoeBoard[i] == this.defaultSymbol) {
        // If there's no :x: or :o: on a slot, it cannot be a winning diagonal.
        break;
      }

      if (this.tictactoeBoard[i] == ':x:') Xcounter++;
      else Ocounter++;

      // If the entire diagonal was checked.
      if (i == 8) {
        // If the diagonal is completed marked with a :x: or with a :o: its a winning play.
        if (Xcounter == 3) return 1;
        else if (Ocounter == 3) return 2;
      }
    }

    // Reset counters.
    Xcounter = 0;
    Ocounter = 0;

    // Checks for right diagonal.
    for (let i = 2; i < 9; i += 2) {
      if (this.tictactoeBoard[i] == this.defaultSymbol) {
        // If there's no mark on a diagonal slot, it cannot be a winning diagonal.
        break;
      }

      if (this.tictactoeBoard[i] == ':x:') Xcounter++;
      else Ocounter++;

      // If the entire diagonal was checked.
      if (i == 6) {
        // If the diagonal is completed marked with a :x: or with a :o: its a winning play.
        if (Xcounter == 3) return 1;
        else if (Ocounter == 3) return 2;
      }
    }

    // Every slot is marked and no one has won.
    if (this.tictactoeBoard.every((mark) => mark != this.defaultSymbol)) {
      return 0;
    }

    return -1;
  }
}
