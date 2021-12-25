import type { Message } from 'discord.js'
import { Command, Args, container } from '@sapphire/framework'
import { MessageEmbed, User, CollectorFilter } from 'discord.js'
import { configuration } from '@/config'
import { DocumentType } from '@typegoose/typegoose'
import { User as DbUser, GuildData } from '@/database'
import { commandsLinks, logger, defineRoles, UserAnswers } from '@/utils'

const BOARD_POSITIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8]

/**
 * Starts a tic-tac-toe game.
 */
export class TicTacToeCommand extends Command {
  defaultSymbol: string
  tictactoeBoard: string[]

  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      aliases: ['ttt'],
      fullCategory: ['games'],
      description: 'Initiates a tictactoe game.',
    })

    // Default symbol of the board.
    this.defaultSymbol = ':purple_square:'
  }

  /**
   * It executes when someone types the "tictactoe" command.
   */
  async messageRun(message: Message, args: Args): Promise<Message> {
    // Obtains the challenging player instance.
    const { author: player1 } = message
    const player2 = await args.pick('user')

    const gameInstanceActive = (
      await container.db.guildService.getById(message.guild.id)
    ).gameInstanceActive

    if (gameInstanceActive) {
      return message.channel.send(
        `There's already a game in course ${player1}!`
      )
    }
    if (player1.id === player2.id) {
      return message.channel.send('You cannot challenge yourself ¬¬ ...')
    }
    if (player2.bot) {
      return message.channel.send(
        "You cannot challenge me :anger: I'm a superior being... I would destroy you n.n :purple_heart:"
      )
    }

    const filter: CollectorFilter<Message[]> = (response) => {
      const gameResponse = response.content.toUpperCase()
      return (
        response.author.id === player2.id &&
        (gameResponse === UserAnswers.N || gameResponse === UserAnswers.Y)
      )
    }

    await message.channel.send(
      `${player2} has been challenged by ${player1} to play #. Do you accept the challenge? (y/n)`
    )

    // Waits 15 seconds while player2 types a valid answer (y/n).
    const collectedMessages = await message.channel.awaitMessages({
      filter,
      max: 1,
      time: 15000,
    })

    if (!collectedMessages.first()) {
      return message.channel.send(
        `Time's up! ${player2.username} doesn't want to play ):`
      )
    }

    const receivedMsg = collectedMessages.first().content.toUpperCase()
    if (receivedMsg === UserAnswers.N || receivedMsg === UserAnswers.NO) {
      return message.channel.send(
        `Game cancelled ): Come back when you are brave enough, ${player2}.`
      )
    }

    try {
      const { id } = message.guild
      const guild = await container.db.guildService.getById(id)
      guild.gameInstanceActive = true
      await guild.save()

      this.ticTacToeInstance(message, player1, player2)
    } catch (error) {
      logger.error(
        `MongoDB Connection error. Could not register change game instance active state for ${message.guild.name}`,
        {
          context: this.constructor.name,
        }
      )
      return message.channel.send(
        'Error ): could not start game. Try again later :purple_heart:'
      )
    }
  }

  /**
   * Manages the tictactoe game and its properties.
   */
  async ticTacToeInstance(message: Message, player1: User, player2: User) {
    this.tictactoeBoard = Array(9).fill(this.defaultSymbol)
    const { id: guildId } = message.guild

    const random = Math.random() < 0.5
    let activePlayer = random ? player1 : player2
    let otherPlayer = random ? player2 : player1

    const embedMessage = this.embedDefaultTicTacToeBoard(player1, player2)
      .addField(
        'Instructions',
        'Type the number where you want to make your move.',
        false
      )
      .addField('Current turn', `It's your turn ${activePlayer.username}`)

    const sentEmbedMessage = await message.channel.send({
      embeds: [embedMessage],
    })

    const collector = message.channel.createMessageCollector({
      filter: (receivedMsg: Message) => {
        if (receivedMsg.author.bot) {
          return false
        }

        // if the receivedMsg is the cancel game command, passes the filter for later collector ends.
        const possibleCancelledGame = receivedMsg.content
          .split(' ')[0]
          .split(configuration.prefix)[1]

        const gameCancelled =
          possibleCancelledGame === 'cg' ||
          possibleCancelledGame === 'cancelGame'
        if (gameCancelled) {
          collector.stop('Cancel game command executed.')
        }

        // Checks if the played position is valid.
        const playedPosition = receivedMsg.content
        const validPlay =
          !Number.isInteger(playedPosition) &&
          BOARD_POSITIONS.some(
            (position: number) => position === parseInt(playedPosition)
          ) &&
          this.tictactoeBoard[playedPosition] === this.defaultSymbol

        return receivedMsg.author.id === activePlayer.id && validPlay
      },
      max: 9,
    })

    collector.on('collect', async (m: Message) => {
      const playedNumber = m.content
      try {
        // Deletes the message with the player's move.
        await m.delete()
      } catch (error) {}

      // If player1 made a move, the mark is :x:. If it was player2, the mark is a :o:.
      activePlayer.id === player1.id
        ? (this.tictactoeBoard[playedNumber] = ':x:')
        : (this.tictactoeBoard[playedNumber] = ':o:')

      // Change the play turn.
      ;[activePlayer, otherPlayer] = [otherPlayer, activePlayer]

      // Creates the new embed message with the new mark.
      const newEmbedMessage = this.embedDefaultTicTacToeBoard(player1, player2)

      // Obtains the current state of the game.
      const gameState = this.obtainGameState(parseInt(playedNumber))

      if (gameState !== -1) {
        // Game was tied or a player won.
        let result: string
        let stopReason: string
        let winner: User
        let loser: User
        switch (gameState) {
          case 0:
            result = 'The game was a tie! :confetti_ball: Thanks for play (:'
            stopReason = `Tictactoe game between ${player1.username} and ${player2.username} ends!`
            break
          case 1:
            result = `:tada: CONGRATULATIONS ${player1}! You have won! :tada:`
            stopReason = `${player1.username} won on TicTacToe against ${player2.username}!`
            winner = player1
            loser = player2
            break
          case 2:
            result = `:tada: CONGRATULATIONS ${player2}! You have won! :tada:`
            stopReason = `${player2.username} won on TicTacToe against ${player1.username}!`
            winner = player2
            loser = player1
            break
        }

        if (winner) {
          try {
            logger.info(
              `Registering ${winner.username}'s tictactoe victory in '${m.guild.name}' guild...`,
              {
                context: this.constructor.name,
              }
            )

            const score = 10
            let finalScore = score
            const user: DocumentType<DbUser> =
              await container.db.userService.getById(winner.id)
            if (user) {
              const guildDataIdx = user.guildsData.findIndex(
                (guildData) => guildData.guildId === guildId
              )
              user.guildsData[guildDataIdx].participationScore += score
              user.guildsData[guildDataIdx].tictactoeWins += 1
              finalScore = user.guildsData[guildDataIdx].participationScore
              await user.save()
            } else {
              const guildData: GuildData = {
                guildId,
                participationScore: score,
              }
              const newUser: DbUser = {
                discordId: winner.id,
                name: winner.username,
                guildsData: [guildData],
              }
              await container.db.userService.create(newUser)
            }

            const authorGuildMember = await message.guild.members.fetch(
              winner.id
            )
            defineRoles(finalScore, authorGuildMember, message)
            logger.info('Victory registered successfully', {
              context: this.constructor.name,
            })
          } catch (error) {
            logger.error(
              `MongoDB Connection error. Could not register ${winner.username}'s tictactoe victory`,
              {
                context: this.constructor.name,
              }
            )
          }
        }

        newEmbedMessage.addField('Result :trophy:', result, false)
        if (winner && loser) {
          newEmbedMessage.addField(
            'Consolation prize :second_place:',
            `Don't worry ${loser}, this is for you:`
          )
          newEmbedMessage.setImage(commandsLinks.games.tictactoe.gifs[0])
        } else if (!winner && !loser) {
          newEmbedMessage.addField(
            'Consolation prize :woozy_face:',
            `You two are so bad, this is for you <3`
          )
          newEmbedMessage.setImage(commandsLinks.games.tictactoe.gifs[0])
        }

        // Edits the embed tictactoe message.
        await sentEmbedMessage.edit({ embeds: [newEmbedMessage] })

        // Stop message collection.
        collector.stop(stopReason)
      } else {
        newEmbedMessage
          .addField(
            'Instructions',
            'Type the number where you want to make your move.',
            false
          )
          .addField(
            'Current turn',
            `It's your turn ${activePlayer.username}`,
            false
          )

        // Edits the embed tictactoe message.
        await sentEmbedMessage.edit({ embeds: [newEmbedMessage] })
      }
    })

    collector.on('end', async (_: any, reason: any) => {
      // Unlocks the game instance.
      try {
        const guild = await container.db.guildService.getById(guildId)
        guild.gameInstanceActive = false
        await guild.save()
      } catch (error) {
        logger.error(
          `MongoDB Connection error. Could not change game instance active for ${message.guild.name} server`,
          {
            context: this.constructor.name,
          }
        )
      }

      logger.info(reason, {
        context: this.constructor.name,
      })
    })
  }

  /**
   * Creates a generic tictactoe board.
   */
  embedDefaultTicTacToeBoard(player1: User, player2: User): MessageEmbed {
    return new MessageEmbed()
      .setTitle(`:x::o: Gato:3 :x::o:`)
      .setColor(configuration.embedMessageColor)
      .setDescription(
        'Tres en raya | Michi | Triqui | Gato | Cuadritos | Tictactoe | Whatever'
      )
      .addField(
        'Challengers',
        `${player1.username} V/S ${player2.username}`,
        false
      )
      .addField(
        'Board',
        `
        ${this.tictactoeBoard[0]}${this.tictactoeBoard[1]}${this.tictactoeBoard[2]}
        ${this.tictactoeBoard[3]}${this.tictactoeBoard[4]}${this.tictactoeBoard[5]}
        ${this.tictactoeBoard[6]}${this.tictactoeBoard[7]}${this.tictactoeBoard[8]}
        `,
        true
      )
      .addField(
        'Positions reference',
        `
        :zero::one::two:
        :three::four::five:
        :six::seven::eight:
        `,
        true
      )
  }

  /**
   * It resolves if the game is a tie or if someone has won.
   * (-1) : No one has won yet.
   * (0) : Tied.
   * (1) : Player 1 won.
   * (2) : Player 2 won.
   */
  obtainGameState(playedNumber: number): number {
    let Xcounter = 0
    let Ocounter = 0

    let initialRowPosition = -1
    // Depending of the played number, we have to check certain row.
    if (playedNumber >= 0 && playedNumber <= 2) initialRowPosition = 0
    else if (playedNumber >= 3 && playedNumber <= 5) initialRowPosition = 3
    else initialRowPosition = 6

    // Checks for played row.
    for (let i = initialRowPosition; i < initialRowPosition + 3; i++) {
      if (this.tictactoeBoard[i] === this.defaultSymbol) {
        // If there's no :x: or :o: on a row slot, it cannot be a winning row.
        break
      }

      if (this.tictactoeBoard[i] === ':x:') Xcounter++
      else Ocounter++

      // If the entire row was checked.
      if (i + 1 === initialRowPosition + 3) {
        // If a row is completed marked with :x: or :o: its a winning play.
        if (Xcounter === 3) return 1
        else if (Ocounter === 3) return 2
      }
    }

    // Reset counters.
    Xcounter = 0
    Ocounter = 0

    let initialColPosition = -1
    // Depending of the played number, we have to check certain column.
    if (playedNumber === 0 || playedNumber === 3 || playedNumber === 6)
      initialColPosition = 0
    else if (playedNumber === 1 || playedNumber === 4 || playedNumber === 7)
      initialColPosition = 1
    else initialColPosition = 2

    // Checks for played column.
    for (let i = initialColPosition; i < 9; i += 3) {
      if (this.tictactoeBoard[i] === this.defaultSymbol) {
        // If there's no :x: or :o: on a column slot, it cannot be a winning column.
        break
      }

      if (this.tictactoeBoard[i] === ':x:') Xcounter++
      else Ocounter++

      // If the entire column was checked.
      if (i === 6 || i === 7 || i === 8) {
        // If a column is completed marked with :x: or :o: its a winning play.
        if (Xcounter === 3) return 1
        else if (Ocounter === 3) return 2
      }
    }

    // Reset counters.
    Xcounter = 0
    Ocounter = 0

    // Check for left diagonal.
    for (let i = 0; i < 9; i += 4) {
      if (this.tictactoeBoard[i] === this.defaultSymbol) {
        // If there's no :x: or :o: on a slot, it cannot be a winning diagonal.
        break
      }

      if (this.tictactoeBoard[i] === ':x:') Xcounter++
      else Ocounter++

      // If the entire diagonal was checked.
      if (i === 8) {
        // If the diagonal is completed marked with a :x: or with a :o: its a winning play.
        if (Xcounter === 3) return 1
        else if (Ocounter === 3) return 2
      }
    }

    // Reset counters.
    Xcounter = 0
    Ocounter = 0

    // Checks for right diagonal.
    for (let i = 2; i < 9; i += 2) {
      if (this.tictactoeBoard[i] === this.defaultSymbol) {
        // If there's no mark on a diagonal slot, it cannot be a winning diagonal.
        break
      }

      if (this.tictactoeBoard[i] === ':x:') Xcounter++
      else Ocounter++

      // If the entire diagonal was checked.
      if (i === 6) {
        // If the diagonal is completed marked with a :x: or with a :o: its a winning play.
        if (Xcounter === 3) return 1
        else if (Ocounter === 3) return 2
      }
    }

    // Every slot is marked and no one has won.
    if (this.tictactoeBoard.every((mark) => mark !== this.defaultSymbol)) {
      return 0
    }

    return -1
  }
}
