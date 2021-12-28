import {
  Message,
  MessageActionRow,
  MessageEmbed,
  User,
  CollectorFilter,
  MessageComponentInteraction,
  ButtonInteraction,
} from 'discord.js'
import { Command, Args, container } from '@sapphire/framework'

import { configuration } from '@/config'
import { DocumentType } from '@typegoose/typegoose'
import { User as DbUser, GuildData } from '@/database'
import {
  commandsLinks,
  logger,
  defineRoles,
  UserActions,
  TicTacToeMoveResolverParams,
  GameFinalState,
  TicTacToeButtonId,
  getButton,
  getTttMoveButton,
  getCancelGameButton,
  tttGameResults,
} from '@/utils'

/**
 * Starts a tic-tac-toe game.
 */
export class TicTacToeCommand extends Command {
  private readonly defaultSymbol = ':purple_square:'
  private readonly squaresNumber = 9
  private board: string[]
  private moveResolver: Record<
    UserActions,
    (_: TicTacToeMoveResolverParams) => Promise<Message<boolean> | void>
  > = {
    [UserActions.IGNORE]: this.ignore.bind(this),
    [UserActions.REJECT]: this.reject.bind(this),
    [UserActions.ACCEPT]: this.accept.bind(this),
  }

  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      aliases: ['ttt'],
      fullCategory: ['games'],
      description: 'Initiates a tictactoe game.',
      preconditions: ['BotInitializeOnly'],
      runIn: ['GUILD_ANY'],
    })
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
    /* if (player1.id === player2.id) {
      return message.channel.send('You cannot challenge yourself ¬¬ ...')
    } */
    if (player2.bot) {
      return message.channel.send(
        "You cannot challenge me :anger: I'm a superior being... I would destroy you n.n :purple_heart:"
      )
    }

    const filter: CollectorFilter<[MessageComponentInteraction<'cached'>]> = (
      btnInteraction
    ) => btnInteraction.user.id === player2.id

    const buttons = new MessageActionRow().addComponents(
      getButton(TicTacToeButtonId.ACCEPT, 'YES', 'SUCCESS'),
      getButton(TicTacToeButtonId.REJECT, 'NO', 'DANGER')
    )

    const actionMessage = await message.channel.send({
      content: `${player2} has been challenged by ${player1} to play #. Do you accept the challenge?`,
      components: [buttons],
    })

    // Waits 15 seconds while player2 clicks button.
    const collector = message.channel.createMessageComponentCollector({
      filter,
      max: 1,
      time: 1000 * 15,
    })

    let player2Action = UserActions.IGNORE
    collector.on('end', async (collection) => {
      if (collection.first()?.customId === TicTacToeButtonId.REJECT) {
        player2Action = UserActions.REJECT
      } else if (collection.first()?.customId === TicTacToeButtonId.ACCEPT) {
        player2Action = UserActions.ACCEPT
      }

      this.moveResolver[player2Action]({ message, player2, player1 }).then(
        (message?: Message) => {
          actionMessage.delete().catch()
          setTimeout(() => {
            message?.delete().catch()
          }, 1000 * 3)
        }
      )
    })
  }

  async ignore({ message, player2 }: TicTacToeMoveResolverParams) {
    return message.channel.send(
      `Time's up! ${player2.username} doesn't want to play ):`
    )
  }

  reject({ message, player2 }: TicTacToeMoveResolverParams) {
    return message.channel.send(
      `Game cancelled ): Come back when you are brave enough, ${player2}.`
    )
  }

  async accept({ message, player2, player1 }: TicTacToeMoveResolverParams) {
    try {
      const { id } = message.guild
      const guild = await container.db.guildService.getById(id)
      guild.gameInstanceActive = true
      await guild.save()

      this.runTtt(message, player1, player2)
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
  async runTtt(message: Message, player1: User, player2: User) {
    const availableMoves = [...Array(this.squaresNumber).keys()]
    this.board = Array(this.squaresNumber).fill(this.defaultSymbol)
    const { id: guildId } = message.guild

    let { activePlayer, otherPlayer } = this.getInitialOrder(player1, player2)

    const embedMessage = this.embedDefaultboard(player1, player2)
      .addField(
        'Instructions',
        'Type the number where you want to make your move.',
        false
      )
      .addField('Current turn', `It's your turn ${activePlayer.username}`)

    const firstMovesRow = new MessageActionRow().addComponents(
      availableMoves
        .slice(0, (availableMoves.length + 1) / 2)
        .map(getTttMoveButton)
    )

    const secondMovesRow = new MessageActionRow()
      .addComponents(
        availableMoves
          .slice((availableMoves.length + 1) / 2, availableMoves.length)
          .map(getTttMoveButton)
      )
      .addComponents(getCancelGameButton(TicTacToeButtonId.CANCEL))

    const sentEmbedMessage = await message.channel.send({
      embeds: [embedMessage],
      components: [firstMovesRow, secondMovesRow],
    })

    const moveFilter: CollectorFilter<
      [MessageComponentInteraction<'cached'>]
    > = (btnInteraction) => {
      const playerId = [player1.id, player2.id].find(
        (id) => id === btnInteraction.user.id
      )
      if (!playerId) return false
      if (btnInteraction.customId === TicTacToeButtonId.CANCEL) {
        collector.stop('Game cancelled.')
        return true
      }

      return btnInteraction.user.id === activePlayer.id
    }

    const collector = message.channel.createMessageComponentCollector({
      filter: moveFilter,
      max: 9,
    })

    collector.on('collect', async (i: ButtonInteraction) => {
      const playedNumber = parseInt(i.component.label)

      // If player1 made a move, the mark is :x:. If it was player2, the mark is :o:
      activePlayer.id === player1.id
        ? (this.board[playedNumber] = ':x:')
        : (this.board[playedNumber] = ':o:')

      // Change the play turn.
      ;[activePlayer, otherPlayer] = [otherPlayer, activePlayer]

      const updatedButtons = sentEmbedMessage.components.map((row) => {
        return {
          ...row,
          components: row.components.filter(
            (btn) => btn.customId !== i.customId
          ),
        }
      })

      // Creates the new embed message with the new mark.
      const newEmbedMessage = this.embedDefaultboard(player1, player2)

      // Obtains the current state of the game.
      const gameState = this.obtainGameState(playedNumber)

      if (gameState !== GameFinalState.UNDEFINED) {
        let winner: User
        let loser: User

        if (gameState === GameFinalState.PLAYER1_VICTORY)
          [winner, loser] = [player1, player2]
        else if (gameState === GameFinalState.PLAYER2_VICTORY)
          [winner, loser] = [player2, player1]

        if (winner) {
          try {
            logger.info(
              `Registering ${winner.username}'s tictactoe victory in '${i.guild.name}' guild...`,
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

        const { result, stopReason } = tttGameResults[gameState]({
          player1,
          player2,
        })

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
        await i.update({
          embeds: [newEmbedMessage],
          components: [],
        })

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

        // Edits the embed message.
        await i.update({
          embeds: [newEmbedMessage],
          components: updatedButtons,
        })
      }
    })

    collector.on('end', async (_: any, reason: any) => {
      setTimeout(() => {
        sentEmbedMessage.delete().catch()
      }, 1000 * 10)
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
  embedDefaultboard(player1: User, player2: User): MessageEmbed {
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
        ${this.board[0]}${this.board[1]}${this.board[2]}
        ${this.board[3]}${this.board[4]}${this.board[5]}
        ${this.board[6]}${this.board[7]}${this.board[8]}
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

  getInitialOrder(player1: User, player2: User) {
    const random = Math.random() < 0.5
    return {
      activePlayer: random ? player1 : player2,
      otherPlayer: random ? player2 : player1,
    }
  }

  /**
   * It resolves if the game is a tie or if someone has won.
   */
  obtainGameState(playedNumber: number): GameFinalState {
    // WHen game is cancelled
    if (isNaN(playedNumber)) return GameFinalState.TIE

    const playedMark = this.board[playedNumber]

    // Depending of the played number, we check some row and column.
    const initRowPos = playedNumber - (playedNumber % 3)
    const initColPos = playedNumber % 3

    const rowPositions = [
      this.board[initRowPos],
      this.board[initRowPos + 1],
      this.board[initRowPos + 2],
    ]

    const colPositions = [
      this.board[initColPos],
      this.board[initColPos + 3],
      this.board[initColPos + 6],
    ]

    const leftDiagonalPositions = [this.board[0], this.board[4], this.board[8]]
    const rightDiagonalPositions = [this.board[2], this.board[4], this.board[6]]

    if (
      rowPositions.every((pos) => pos === playedMark) ||
      colPositions.every((pos) => pos === playedMark) ||
      leftDiagonalPositions.every((pos) => pos === playedMark) ||
      rightDiagonalPositions.every((pos) => pos === playedMark)
    ) {
      return playedMark === ':x:'
        ? GameFinalState.PLAYER1_VICTORY
        : GameFinalState.PLAYER2_VICTORY
    }

    // Every slot is marked and no one has won.
    if (this.board.every((mark) => mark !== this.defaultSymbol)) {
      return GameFinalState.TIE
    }

    return GameFinalState.UNDEFINED
  }
}
