import { index, prop } from '@typegoose/typegoose';

// 1 = asc order, -1 = desc order.
@index({ discordId: 'text' }, { weights: { discordId: 1 } })
export default class User {
  constructor(
    discordId: string,
    name: string,
    tictactoeWins?: number,
    participationScore?: number,
  ) {
    this.discordId = discordId;
    this.name = name;
    this.tictactoeWins = tictactoeWins;
    this.participationScore = participationScore;
  }

  @prop(String)
  public discordId: string;

  @prop(String)
  public name: string;

  @prop({
    type: Number,
    default: 0,
  })
  public tictactoeWins?: number;

  @prop({
    type: Number,
    default: 0,
  })
  public participationScore?: number;
}
