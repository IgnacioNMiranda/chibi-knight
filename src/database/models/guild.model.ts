import { index, prop } from '@typegoose/typegoose';

@index({ guildId: 'text' }, { weights: { guildId: 1 } })
export default class Guild {
  constructor(
    guildId: string,
    rolesActivated?: boolean,
    gameInstanceActive?: boolean,
  ) {
    this.guildId = guildId;
    this.rolesActivated = rolesActivated;
    this.gameInstanceActive = gameInstanceActive;
  }

  @prop({
    type: String,
  })
  public guildId: string;

  @prop({
    type: Boolean,
    default: false,
  })
  rolesActivated?: boolean;

  @prop({
    type: Boolean,
    default: false,
  })
  public gameInstanceActive?: boolean;
}
