import { BotRoles } from '..'

export const roles: Record<
  BotRoles,
  { name: string; requiredPoints: number; imageUrl: string }
> = {
  [BotRoles.ZOTE]: {
    name: 'Zote',
    requiredPoints: 50,
    imageUrl:
      'https://i.pinimg.com/originals/ee/03/46/ee034690129e85474178822972cc9694.gif',
  },
  [BotRoles.FALSE_KNIGHT]: {
    name: 'False Knight',
    requiredPoints: 250,
    imageUrl:
      'https://64.media.tumblr.com/356b8e0e7dee00acc039604288194b3c/tumblr_px601eoSrB1wv5hmyo3_400.gif',
  },
  [BotRoles.HORNET]: {
    name: 'Hornet',
    requiredPoints: 500,
    imageUrl: 'https://thumbs.gfycat.com/SilverMellowHippopotamus-max-1mb.gif',
  },
  [BotRoles.LOST_KIN]: {
    name: 'Lost Kin',
    requiredPoints: 1000,
    imageUrl:
      'https://i.pinimg.com/originals/7f/ef/77/7fef776fab7c8e84fb0fe8923ac275ac.gif',
  },
  [BotRoles.HIVE_KNIGHT]: {
    name: 'Hive Knight',
    requiredPoints: 2000,
    imageUrl:
      'https://64.media.tumblr.com/a3fe65707da54f7b94fa2ef73300ad0e/tumblr_phxzts4UTK1wv5hmyo2_400.gif',
  },
  [BotRoles.SOUL_MASTER]: {
    name: 'Soul Master',
    requiredPoints: 3000,
    imageUrl:
      'https://cs9.pikabu.ru/post_img/2017/05/14/8/1494769148116435151.gif',
  },
  [BotRoles.WHITE_DEFENDER]: {
    name: 'White Defender',
    requiredPoints: 5000,
    imageUrl:
      'https://64.media.tumblr.com/10cbee955cdc5787510ac0556832d6f8/tumblr_phxzts4UTK1wv5hmyo7_400.gif',
  },
  [BotRoles.GREAT_NAILSAGE_SLY]: {
    name: 'Great Nailsage Sly',
    requiredPoints: 8000,
    imageUrl:
      'https://thumbs.gfycat.com/DefinitiveScientificHerring-max-1mb.gif',
  },
  [BotRoles.HOLLOW_KNIGHT]: {
    name: 'Hollow Knight',
    requiredPoints: 12000,
    imageUrl:
      'https://i.pinimg.com/originals/0f/b6/67/0fb667fdaf03499eddff4829c14fa463.gif',
  },
  [BotRoles.THE_KNIGHT]: {
    name: 'The Knight',
    requiredPoints: 17000,
    imageUrl:
      'https://media1.tenor.com/images/e055198dce05b168933a08bed1c39145/tenor.gif',
  },
  [BotRoles.NIGHTMARE_GRIMM]: {
    name: 'Nightmare Grimm',
    requiredPoints: 23000,
    imageUrl:
      'https://i.pinimg.com/originals/cc/71/fc/cc71fc9af0932bee91a36ced6e9fcf93.gif',
  },
  [BotRoles.PURE_VESSEL]: {
    name: 'Pure Vessel',
    requiredPoints: 30000,
    imageUrl:
      'https://media1.tenor.com/images/cf6017c33f4a5a7f3e727d652ad93239/tenor.gif',
  },
  [BotRoles.THE_ASCENDED_KNIGHT]: {
    name: 'The Ascended Knight',
    requiredPoints: 50000,
    imageUrl:
      'https://thumbs.gfycat.com/FixedSmartJanenschia-size_restricted.gif',
  },
}
