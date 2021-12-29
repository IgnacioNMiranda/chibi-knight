import { index, prop } from '@typegoose/typegoose'

@index({ guildId: 'text' }, { weights: { guildId: 1 } })
export class Guild {
  @prop({
    type: String,
  })
  public guildId: string

  @prop({
    type: Boolean,
    default: false,
  })
  rolesActivated?: boolean

  @prop({
    type: Boolean,
    default: false,
  })
  public gameInstanceActive?: boolean

  @prop({
    type: String,
    default: 'en-US',
  })
  public guildLanguage?: string
}
