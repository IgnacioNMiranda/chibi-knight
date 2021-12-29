import { Args, Command } from '@sapphire/framework'
import { Message, MessageAttachment, MessageEmbed } from 'discord.js'
import { BotChannel, botLogoURL, commandsCategoriesDescriptions, getBotLogo, languageKeys } from '@/utils'
import { configuration } from '@/config'
import { resolveKey } from '@sapphire/plugin-i18next'

/**
 * Sends an embed message with information of every existing command.
 */
export class HelpCommand extends Command {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      aliases: ['h'],
      description: languageKeys.commands.misc.help.description,
    })
  }

  /**
   * It executes when someone types the "help" command.
   */
  async messageRun(message: Message, args: Args): Promise<Message<boolean>> {
    const embedMessage = new MessageEmbed()
      .setAuthor({
        name: configuration.appName,
        iconURL: botLogoURL,
      })
      .setThumbnail(botLogoURL)
      .setColor(configuration.embedMessageColor)

    const commandName = await args.pick('string').catch(() => null)

    if (commandName) {
      return this.buildCommandHelp(commandName, message.channel)
    }

    return this.buildHelpForEveryCommand(embedMessage, message.channel, [getBotLogo()])
  }

  async buildCommandHelp(commandName: string, channel: BotChannel) {
    const command = this.store.get(commandName) as Command
    // TODO: when implement localization

    if (command) {
      /* let cmdArgs = ''
        if (command.argsCollector) {
          const { args } = command.argsCollector
          if (args[0].type.id === 'user') cmdArgs = ' @User'
          else if (args[0].type.id === 'string') cmdArgs = ` {${args[0].key}}`
        }

        embedMessage.addField(
          `${command.name.toLocaleUpperCase()}: `,
          `
          **Description**: ${command.description}
          **Aliases**: ${command.aliases}
          **Parameters**: ${cmdArgs === '' ? 'None' : cmdArgs}
          **Syntax**: ${configuration.prefix}${command.aliases[0]}${cmdArgs}
          `
        )

        embedMessage.setFooter(
          `Type ${configuration.prefix}help to see a list with every available command.`
        )
        return message.channel.send({ embeds: [embedMessage], files: [botLogo] }) */
    }

    const unknownCommandMessage = await resolveKey(channel, languageKeys.commands.misc.help.unknownCommandError, {
      prefix: configuration.prefix,
    })

    return channel.send(unknownCommandMessage)
  }

  async buildHelpForEveryCommand(message: MessageEmbed, channel: BotChannel, files: MessageAttachment[]) {
    const { appName, prefix } = configuration
    const description = await resolveKey(channel, languageKeys.commands.misc.help.everyCommandEmbedMessageDescription, {
      appName,
    })
    message.setDescription(description)

    const commands = this.store.container.stores.get('commands')
    const categories = new Set<string>()

    Array(...commands.values()).forEach((command) => {
      if (command.enabled && !categories.has(command.category)) {
        categories.add(command.category)
      }
    })

    const noCommandDescription = await resolveKey(channel, languageKeys.commands.misc.help.commandWithoutDescription)
    const fieldsBuilder = [...categories.values()].map(async (category) => {
      const commandsParsers = commands
        .filter((command) => command.category === category && command.enabled)
        .map(async (cmd) => {
          const commandDescription = (await resolveKey(channel, cmd.description)) ?? noCommandDescription
          return `**${configuration.prefix}${cmd.name}** → ${commandDescription}`
        })
      const parsedCommands = await Promise.all(commandsParsers)
      return {
        category: commandsCategoriesDescriptions[category],
        commands: parsedCommands,
      }
    })

    const fields = await Promise.all(fieldsBuilder)

    fields.forEach((field) => {
      message.addField(field.category, field.commands.join('\n'))
    })

    const footer = await resolveKey(channel, languageKeys.commands.misc.help.everyCommandEmbedMessageFooter, {
      prefix,
    })
    message.setFooter(footer)
    return channel.send({ embeds: [message], files })
  }
}
