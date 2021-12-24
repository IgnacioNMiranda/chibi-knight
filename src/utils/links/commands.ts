import { BotCommandsGroup, GameCommand, MiscCommand } from '../types'

export interface CommandsLinks {
  [BotCommandsGroup.GAMES]: Record<GameCommand, any>
  [BotCommandsGroup.MISC]: Record<MiscCommand, any>
}

export const commandsLinks: CommandsLinks = {
  [BotCommandsGroup.GAMES]: {
    tictactoe: {
      gifs: [
        'https://media.tenor.com/images/5d12401ee6fa62de116e70d3c99bb4cc/tenor.gif',
      ],
    },
    cancelGame: {},
    tictactoeleaderboard: {},
  },
  [BotCommandsGroup.MISC]: {
    congratulate: {
      gifs: [
        'https://media1.tenor.com/images/78dcb7365d844e2cd0b8832366448dbf/tenor.gif',
        'https://media1.tenor.com/images/e3da22e65b21255ae292ad5fa051e030/tenor.gif',
      ],
    },
    shameonyou: {
      gifs: [
        'https://media1.tenor.com/images/45ab613e131ca0cb402f22da7b3c0f2d/tenor.gif',
        'https://media1.tenor.com/images/229c7a4d943aa9d7aeff61adb6dc59db/tenor.gif',
      ],
    },
    help: {},
    iniChibiKnight: {},
    say: {},
  },
}

// Questions and Answers for games.

export const QandA = {
  initiateGame: {
    answers: ['y', 'n'],
    ticTacToePositions: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  },
}
