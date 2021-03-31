import { ReturnModelType, getModelForClass } from '@typegoose/typegoose';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import logger from '../../logger';
import Server from '../../database/models/server.model';
import { openMongoConnection } from '../../database/mongo';
import { app } from '../../main';
import configuration from '../../config/configuration';
import { roles, initRoles } from '../../utils/roles.utils';
import ServerDTO from '../../database/dto/server.dto';

/**
 * Activate roles functionality.
 */
export default class ActivateRolesCommand extends Command {
  private readonly serverRepository: ReturnModelType<typeof Server>;

  constructor(client: CommandoClient) {
    super(client, {
      name: 'activateroles',
      aliases: ['ar'],
      group: 'roles',
      memberName: 'activateroles',
      description: 'Activates bot roles.',
      args: [],
    });

    this.serverRepository = getModelForClass(Server);
  }

  /**
   * It executes when someone types the "activaterolesgame" command.
   */
  async run(message: CommandoMessage): Promise<Message> {
    try {
      const cachedServer = app.cache.cache.get(message.guild.id);
      if (cachedServer?.rolesActivated) {
        return message.say(
          `You already have initialize ${configuration.appName}'s roles :relieved:`,
        );
      }

      const mongoose = await openMongoConnection();
      const server = await this.serverRepository.findOne({
        guildId: message.guild.id,
      });
      if (server?.rolesActivated) {
        return message.say(
          `You already have initialize ${configuration.appName}'s roles :relieved:`,
        );
      } else {
        let rolesList = '';
        const everyRole = Object.values(roles);
        everyRole.forEach((role) => {
          rolesList += `• ${role.name} \n`;
        });

        const embedMessage = new MessageEmbed()
          .attachFiles(['./public/img/chibiKnightLogo.png'])
          .setAuthor('Chibi Knight', 'attachment://chibiKnightLogo.png')
          .setThumbnail('attachment://chibiKnightLogo.png')
          .addField('The next roles will be added to your server:', rolesList)
          .setColor(configuration.embedMessageColor)
          .setFooter(
            `Do you really want to activate ${configuration.appName}'s roles ? (yes/y/no/n)`,
          );
        await message.say(embedMessage);

        const filter = (response: any) => {
          return response.author.id === message.author.id;
        };
        // Waits 15 seconds while types a valid answer (yes/y/no/n).
        const collectedMessages = await message.channel.awaitMessages(filter, {
          max: 1,
          time: 15000,
        });

        if (collectedMessages?.first()) {
          const receivedResponse = collectedMessages.first().content;
          if (receivedResponse === 'yes' || receivedResponse === 'y') {
            await message.say(
              `Okay, we're working for you, meanwhile take a nap n.n`,
            );
            const created = await initRoles(message);
            if (created) {
              server.rolesActivated = true;
              await server.save();
              await mongoose.connection.close();

              const cachedServer: ServerDTO = {
                guildId: message.guild.id,
                gameInstanceActive: server.gameInstanceActive,
                rolesActivated: true,
              };
              app.cache.cache.set(message.guild.id, cachedServer);

              return message.say(
                `That was hard :smiling_face_with_tear: Roles created successfully :purple_heart: Try to see yours with ${configuration.prefix}roles command.`,
              );
            } else {
              return message.say(
                `Error while trying to create roles, maybe I don't have enough permissions :sweat:`,
              );
            }
          } else {
            return message.say('Roger!');
          }
        } else {
          return message.say(`Time's up! Try again later ):`);
        }
      }
    } catch (error) {
      console.log(error);
      logger.error(
        `MongoDB Connection error. Could not initiate roles game for '${message.guild.name}' server`,
        { context: this.constructor.name },
      );
      return message.say(
        'It occured an unexpected error, roles could not be created ): Try again later :sweat:',
      );
    }
  }
}
