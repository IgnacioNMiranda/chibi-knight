import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework'
import { CustomCommand, CustomArgs, languageKeys, languagesTypes, getButton, CustomPrecondition } from '@/utils'
import { ButtonInteraction, Message, MessageActionRow } from 'discord.js'
import { resolveKey } from '@sapphire/plugin-i18next'

/**
 * Allows to select the guild language.
 */
export class SelectLanguageCommand extends CustomCommand {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      aliases: ['sl'],
      description: languageKeys.commands.misc.selectlanguage.commandDescription,
      preconditions: [CustomPrecondition.AdminOnly, CustomPrecondition.BotInitializedOnly],
      runIn: [CommandOptionsRunTypeEnum.GuildAny],
    })
  }

  async messageRun(message: Message, { t }: CustomArgs) {
    const availableLanguages = new MessageActionRow().addComponents(
      ...Object.entries(languagesTypes).map(([locale, properties]) =>
        getButton(locale, properties.language, 'PRIMARY', properties.emoji)
      )
    )
    const selectLanguageMsg = await message.channel.send({
      content: t(languageKeys.commands.misc.selectlanguage.messageContent),
      components: [availableLanguages],
    })

    const languageCollector = message.channel.createMessageComponentCollector({
      filter: (btnInteraction) => btnInteraction.user.id === message.author.id,
      max: 1,
      time: 1000 * 15,
    })

    languageCollector.on('collect', async (i: ButtonInteraction) => {
      try {
        const guild = await this.container.db.guildService.getById(message.guild.id)
        guild.guildLanguage = i.customId
        await guild.save()
        const languageChangedMessage = await resolveKey(
          message,
          languageKeys.commands.misc.selectlanguage.languageChangedMessage,
          {
            language: i.component.label,
          }
        )
        await i.update({
          content: languageChangedMessage,
          components: [],
        })
      } catch (error) {
        await i.update(t(languageKeys.errors.unexpectedError))
      }
    })

    languageCollector.on('end', async (collection) => {
      if (!collection.first()) {
        await selectLanguageMsg.edit(t(languageKeys.commands.misc.selectlanguage.ignoreMessage))
      }
      setTimeout(async () => {
        await selectLanguageMsg.delete().catch()
      }, 5000)
    })
  }
}
