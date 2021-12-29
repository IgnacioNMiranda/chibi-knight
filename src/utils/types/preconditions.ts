export enum CustomPrecondition {
  RolesNotActiveOnly = 'RolesNotActiveOnly',
  RolesActiveOnly = 'RolesActiveOnly',
  BotNotInitializeOnly = 'BotNotInitializeOnly',
  BotInitializeOnly = 'BotInitializeOnly',
  AdminOnly = 'AdminOnly',
}

export interface ICustomPreconditions {
  /** Roles */
  [CustomPrecondition.RolesNotActiveOnly]: never
  [CustomPrecondition.RolesActiveOnly]: never

  /** Server */
  [CustomPrecondition.BotNotInitializeOnly]: never
  [CustomPrecondition.BotInitializeOnly]: never

  /** User */
  [CustomPrecondition.AdminOnly]: never
}
