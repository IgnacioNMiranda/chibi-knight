import { TFunction } from '@sapphire/plugin-i18next'
import { getButton } from '..'
import { languageKeys } from '../..'

export * from './tictactoe'

export const getCancelGameButton = (label: string, t: TFunction) =>
  getButton(label, t(languageKeys.commands.games.gameCancelledButtonLabel), 'DANGER')
