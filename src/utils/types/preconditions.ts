export enum CustomPrecondition {
  RolesDeactivatedOnly = 'RolesDeactivatedOnly',
  RolesActivatedOnly = 'RolesActivatedOnly',
  BotNotInitializedOnly = 'BotNotInitializedOnly',
  BotInitializedOnly = 'BotInitializedOnly',
  AdminOnly = 'AdminOnly',
}

export interface ICustomPreconditions {
  /** Roles */
  [CustomPrecondition.RolesDeactivatedOnly]: never
  [CustomPrecondition.RolesActivatedOnly]: never

  /** Server */
  [CustomPrecondition.BotNotInitializedOnly]: never
  [CustomPrecondition.BotInitializedOnly]: never

  /** User */
  [CustomPrecondition.AdminOnly]: never
}
