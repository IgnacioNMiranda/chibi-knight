export type GameCommand = 'cancelGame' | 'tictactoe' | 'tictactoeleaderboard'

export type MiscCommand =
  | 'congratulate'
  | 'help'
  | 'iniChibiKnight'
  | 'say'
  | 'shameonyou'

export type RoleCommand = 'activateRoles' | 'myRole' | 'roles'

export type BotCommand = GameCommand | MiscCommand | RoleCommand

export enum BotCommandsGroup {
  GAMES = 'games',
  MISC = 'misc',
  ROLES = 'roles',
}
