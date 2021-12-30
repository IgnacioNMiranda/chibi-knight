import { GameFinalState, languageKeys, TicTacToeResultsParams } from '../..'

export const tttGameResults: Record<
  GameFinalState,
  (_: TicTacToeResultsParams) => { result: string; stopReason: string }
> = {
  [GameFinalState.PLAYER1_VICTORY]: ({ player1, player2, t }: TicTacToeResultsParams) => ({
    result: t(languageKeys.commands.games.tictactoe.victoryResult, { username: player1.username }),
    stopReason: `${player1.username} won on TicTacToe against ${player2.username}!`,
  }),
  [GameFinalState.PLAYER2_VICTORY]: ({ player1, player2, t }: TicTacToeResultsParams) => ({
    result: t(languageKeys.commands.games.tictactoe.victoryResult, { username: player2.username }),
    stopReason: `${player2.username} won on TicTacToe against ${player1.username}!`,
  }),
  [GameFinalState.TIE]: ({ player1, player2, t }: TicTacToeResultsParams) => ({
    result: t(languageKeys.commands.games.tictactoe.tieResult),
    stopReason: `Tictactoe game between ${player1.username} and ${player2.username} ends!`,
  }),
  [GameFinalState.UNDEFINED]: () => ({ result: '', stopReason: '' }),
}
