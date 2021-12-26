import { Message, User } from 'discord.js'

export type TicTacToeMoveResolverParams = {
  message: Message
  player1?: User
  player2: User
}

export type TicTacToeResultsParams = {
  player1: User
  player2: User
}

export enum TicTacToeButtonId {
  ACCEPT = 'ttt-acceptGame',
  REJECT = 'ttt-rejectGame',
  CANCEL = 'ttt-cancelgame',
}
