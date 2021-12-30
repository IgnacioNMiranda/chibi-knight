import { TFunction } from '@sapphire/plugin-i18next'
import { Message, User } from 'discord.js'

export type TicTacToeMoveResolverParams = {
  message: Message
  player1?: User
  player2: User
  t: TFunction
}

export type TicTacToeResultsParams = {
  player1: User
  player2: User
  t: TFunction
}

export enum TicTacToeButtonId {
  ACCEPT = 'ttt-acceptGame',
  REJECT = 'ttt-rejectGame',
  CANCEL = 'ttt-cancelgame',
}
