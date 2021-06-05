// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Message, MessageEmbed } from 'discord.js';
import { groupsDescriptions } from './resources/groupsDescriptions';
import { configuration } from '../../config/configuration';

/**
 * Sends an embed message with information of every existing command.
 */
export default class HelpCommand extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      // eslint-disable-next-line prettier/prettier
      name: 'help',
      aliases: ['h'],
      group: 'misc',
      memberName: 'help',
      description: 'Gives information about every existing command.',
      args: [
        {
          key: 'command',
          prompt: 'Do you wanna see help from what command?',
          type: 'string',
          default: 'null',
        },
      ],
    });
  }

  /**
   * It executes when someone types the "help" command.
   */
  run(message: CommandoMessage, args: { command: string }): Promise<Message> {
    const embedMessage = new MessageEmbed()
      .attachFiles(['./public/img/chibiKnightLogo.png'])
      .setAuthor(configuration.appName, 'attachment://chibiKnightLogo.png')
      .setThumbnail('attachment://chibiKnightLogo.png')
      .setColor(configuration.embedMessageColor);

    const { command: commandName } = args;
    if (commandName != 'null') {
      const command: Command = this.client.registry.findCommands(
        commandName,
        true,
      )[0];

      if (command) {
        let cmdArgs = '';
        if (command.argsCollector) {
          const { args } = command.argsCollector;
          if (args[0].type.id == 'user') cmdArgs = ' @User';
          else if (args[0].type.id == 'string') cmdArgs = ` {${args[0].key}}`;
        }

        embedMessage.addField(
          `${command.name.toLocaleUpperCase()}: `,
          `
          **Description**: ${command.description}
          **Aliases**: ${command.aliases}
          **Parameters**: ${cmdArgs == '' ? 'None' : cmdArgs}
          **Syntax**: ${configuration.prefix}${command.aliases[0]}${cmdArgs}
          `,
        );

        embedMessage.setFooter(
          `Type ${configuration.prefix}help to see a list with every available command.`,
        );
        return message.say(embedMessage);
      }

      return message.say(
        `Unknown command!! There are no commands with that name ):`,
      );
    }

    embedMessage.setDescription(
      `:crossed_swords: These are the available commands for Chibi Knight n.n`,
    );

    const groups = this.client.registry.groups;
    groups
      .filter((group) =>
        group.commands.some(
          (cmd: Command) => !cmd.hidden && cmd.isUsable(message),
        ),
      )
      .forEach((group) => {
        const commandsList = group.commands
          .filter((cmd: Command) => !cmd.hidden && cmd.isUsable(message))
          .map((cmd: Command) => {
            let cmdArgs = '';
            const argsCollector = cmd.argsCollector;
            if (argsCollector?.args.length > 0) {
              const args = argsCollector.args;
              if (args[0].type.id === 'user') {
                args[0].default == 'null'
                  ? (cmdArgs = ' {@User}')
                  : (cmdArgs = ' @User');
              } else if (args[0].type.id === 'string') {
                cmdArgs = ` {${args[0].key}}`;
              }
            }
            return `**${configuration.prefix}${cmd.name}${cmdArgs}:** ${cmd.description}`;
          });
        const groupTitle = groupsDescriptions[group.id];
        embedMessage.addField(groupTitle, commandsList);
      });

    embedMessage.setFooter(
      `Type ${configuration.prefix}help {command} to see information about an specific command.`,
    );
    return message.say(embedMessage);
  }
}
