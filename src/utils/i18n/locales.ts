export enum LocaleCodes {
  DEFAULT = 'en-US',
  SPANISH_ES = 'es-ES',
}

export enum Languages {
  ESPANOL = 'Español',
  ENGLISH = 'English',
}

export type LocaleCodesProperty = 'emoji' | 'language'

export const languagesTypes: Record<LocaleCodes, Record<LocaleCodesProperty, Languages | string>> = {
  [LocaleCodes.DEFAULT]: {
    emoji: '🇺🇸',
    language: Languages.ENGLISH,
  },
  [LocaleCodes.SPANISH_ES]: {
    emoji: '🇪🇸',
    language: Languages.ESPANOL,
  },
}
