import { index, prop } from '@typegoose/typegoose'
import { GuildData } from './guildData.model'

// 1 = asc order, -1 = desc order.
@index({ discordId: 'text' }, { weights: { discordId: 1 } })
export class User {
  @prop(String)
  public discordId: string

  @prop(String)
  public name: string

  @prop({
    type: [GuildData],
  })
  public guildsData: GuildData[]
}
