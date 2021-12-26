import { getButton } from '..'

export * from './tictactoe'

export const getCancelGameButton = (label: string) =>
  getButton(label, 'CANCEL GAME', 'DANGER')
