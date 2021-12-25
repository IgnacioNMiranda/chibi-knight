export type GameCommand = 'cancelGame' | 'tictactoe' | 'tictactoeleaderboard'

export type MiscCommand =
  | 'congratulate'
  | 'help'
  | 'iniChibiKnight'
  | 'say'
  | 'shameonyou'

export type RoleCommand = 'activateRoles' | 'myRole' | 'roles'

export type BotCommand = GameCommand | MiscCommand | RoleCommand

export enum BotCommandsCategories {
  GAMES = 'games',
  MISC = 'misc',
  ROLES = 'roles',
}

export const commandsCategoriesDescriptions: Record<
  BotCommandsCategories,
  string
> = {
  games: ':game_die: GAMES :game_die:',
  misc: ':tickets: MISCELLANEOUS :tickets:',
  roles: ':jack_o_lantern: ROLES :jack_o_lantern: ',
}
