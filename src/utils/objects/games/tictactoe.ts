import { GameFinalState, TicTacToeResultsParams } from '../..'

export const tttGameResults: Record<
  GameFinalState,
  (_: TicTacToeResultsParams) => { result: string; stopReason: string }
> = {
  [GameFinalState.PLAYER1_VICTORY]: ({ player1, player2 }: TicTacToeResultsParams) => ({
    result: `:tada: CONGRATULATIONS ${player1}! You have won! :tada:`,
    stopReason: `${player1.username} won on TicTacToe against ${player2.username}!`,
  }),
  [GameFinalState.PLAYER2_VICTORY]: ({ player1, player2 }: TicTacToeResultsParams) => ({
    result: `:tada: CONGRATULATIONS ${player2}! You have won! :tada:`,
    stopReason: `${player2.username} won on TicTacToe against ${player1.username}!`,
  }),
  [GameFinalState.TIE]: ({ player1, player2 }: TicTacToeResultsParams) => ({
    result: 'The game was a tie! :confetti_ball: Thanks for play (:',
    stopReason: `Tictactoe game between ${player1.username} and ${player2.username} ends!`,
  }),
  [GameFinalState.UNDEFINED]: () => ({ result: '', stopReason: '' }),
}
