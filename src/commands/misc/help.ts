import { Args, Command } from '@sapphire/framework'
import { Message, MessageAttachment, MessageEmbed } from 'discord.js'
import {
  BotChannel,
  botLogoURL,
  commandsCategoriesDescriptions,
  getBotLogo,
} from '@/utils'
import { configuration } from '@/config'

/**
 * Sends an embed message with information of every existing command.
 */
export class HelpCommand extends Command {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'help',
      aliases: ['h'],
      fullCategory: ['misc'],
      description: 'Gives information about every existing command.',
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
      this.buildCommandHelp(commandName, message.channel)
    }

    return this.buildHelpForEveryCommand(embedMessage, message.channel, [
      getBotLogo(),
    ])
  }

  buildCommandHelp(commandName: string, channel: BotChannel) {
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

    return channel.send(
      `Unknown command!! There are no commands with that name ):`
    )
  }

  buildHelpForEveryCommand(
    message: MessageEmbed,
    channel: BotChannel,
    files: MessageAttachment[]
  ) {
    message.setDescription(
      `:crossed_swords: These are the available commands for Chibi Knight n.n`
    )

    const commands = this.store.container.stores.get('commands')
    const categories = new Set<string>()

    Array(...commands.values()).forEach((command) => {
      if (command.enabled && !categories.has(command.category)) {
        categories.add(command.category)
      }
    })

    const fields = [...categories.values()].map((category) => ({
      category: commandsCategoriesDescriptions[category],
      commands: commands
        .filter((command) => command.category === category && command.enabled)
        .map(
          (cmd) =>
            `**${configuration.prefix}${cmd.name}** → ${
              cmd.description ?? 'No description was provided'
            }`
        ),
    }))

    fields.forEach((field) => {
      message.addField(field.category, field.commands.join('\n'))
    })

    message.setFooter(
      `Type ${configuration.prefix}help {command} to see information about an specific command.`
    )
    return channel.send({ embeds: [message], files })
  }
}
