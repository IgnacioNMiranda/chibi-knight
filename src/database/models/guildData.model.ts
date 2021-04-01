import { index, prop } from '@typegoose/typegoose';

@index({ guildId: 'text' }, { weights: { guildId: 1 } })
export default class GuildData {
  @prop({
    type: String,
  })
  public guildId: string;

  @prop({
    type: Number,
    default: 0,
  })
  public participationScore?: number;

  @prop({
    type: Number,
    default: 0,
  })
  public tictactoeWins?: number;
}
