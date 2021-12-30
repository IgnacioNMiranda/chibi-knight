export enum CustomPrecondition {
  RolesNotActiveOnly = 'RolesNotActiveOnly',
  RolesActiveOnly = 'RolesActiveOnly',
  BotNotInitializedOnly = 'BotNotInitializedOnly',
  BotInitializedOnly = 'BotInitializedOnly',
  AdminOnly = 'AdminOnly',
}

export interface ICustomPreconditions {
  /** Roles */
  [CustomPrecondition.RolesNotActiveOnly]: never
  [CustomPrecondition.RolesActiveOnly]: never

  /** Server */
  [CustomPrecondition.BotNotInitializedOnly]: never
  [CustomPrecondition.BotInitializedOnly]: never

  /** User */
  [CustomPrecondition.AdminOnly]: never
}
