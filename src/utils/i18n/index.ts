import { container } from '@sapphire/framework'
import { Guild } from '@/database'
import { InternationalizationContext } from '@sapphire/plugin-i18next'
import { LocaleCodes } from './locales'

export * as languageKeys from './keys'
export * from './locales'

export const i18nConfig = {
  fetchLanguage: async ({ guild }: InternationalizationContext) => {
    if (!guild) return LocaleCodes.DEFAULT

    const cachedGuild: Guild = container.cache.get(guild.id)
    if (cachedGuild?.guildLanguage) {
      return cachedGuild.guildLanguage
    }

    const dbGuild = await container.db.guildService.getById(guild.id)
    if (dbGuild?.guildLanguage) {
      return dbGuild.guildLanguage
    }

    return LocaleCodes.DEFAULT
  },
  defaultName: LocaleCodes.DEFAULT,
}
