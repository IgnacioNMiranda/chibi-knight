import { TFunction } from '@sapphire/plugin-i18next'
import { BotCommandsCategories, languageKeys } from '..'

export const commandsCategoriesDescriptions: Record<BotCommandsCategories, (t: TFunction) => string> = {
  games: (t: TFunction) => t(languageKeys.categories.gamesCategoryDecoratedTitle),
  misc: (t: TFunction) => t(languageKeys.categories.miscCategoryDecoratedTitle),
  roles: (t: TFunction) => t(languageKeys.categories.rolesCategoryDecoratedTitle),
}
