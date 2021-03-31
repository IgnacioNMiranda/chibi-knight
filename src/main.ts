import pathlib from 'path';
import configuration from './config/configuration';
import { CommandoClient } from 'discord.js-commando';
import logger from './logger';
import {
  DocumentType,
  getModelForClass,
  ReturnModelType,
} from '@typegoose/typegoose';
import DbUser from './database/models/user.model';
import { defineRoles } from './utils/roles.utils';
import Server from './database/models/server.model';
import Cache from './database/Cache';
import { openMongoConnection } from './database/mongo';
import { TextChannel } from 'discord.js';

class App {
  // Instance of the bot client.
  client: CommandoClient;

  // MongoDB Repositories.
  private readonly serverRepository: ReturnModelType<typeof Server>;
  private readonly userRepository: ReturnModelType<typeof DbUser>;

  cache: Cache;

  constructor() {
    this.userRepository = getModelForClass(DbUser);
    this.serverRepository = getModelForClass(Server);
    this.initClient();
  }

  async initClient() {
    this.client = new CommandoClient({
      commandPrefix: configuration.prefix,
      owner: configuration.clientId,
      invite: '',
    });

    this.client.registry.registerDefaultTypes().registerGroups([
      ['games', 'Games commands'],
      ['misc', 'Miscellaneous commands'],
      ['music', 'Music commands'],
      ['roles', 'Roles commands'],
    ]);

    if (configuration.env === 'development') {
      this.client.registry.registerCommandsIn({
        filter: /^([^.].*)\.ts$/,
        dirname: pathlib.join(__dirname, './commands'),
      });
    } else {
      this.client.registry.registerCommandsIn({
        filter: /^([^.].*)\.js$/,
        dirname: pathlib.join(__dirname, './commands'),
      });
    }

    this.registerEvents();

    try {
      logger.info('Logging in...', {
        context: this.constructor.name,
      });
      await this.client.login(configuration.token);

      this.cache = new Cache();
      setTimeout(this.cache.refresh, 1000 * 60 * 60);
    } catch (error) {
      const { code, method, path } = error;
      console.error(`Error ${code} trying to ${method} to ${path} path`);
    }
  }

  registerEvents() {
    // When Chibi Knight has login.
    this.client.once('ready', () => {
      this.client.user.setActivity(`${configuration.prefix}help`);
      logger.info(`${this.client.user.username} is online n.n`, {
        context: this.constructor.name,
      });
    });

    this.client.on('error', console.error).on('warn', console.warn);

    this.client.on('message', async (message) => {
      if (!message.author.bot) {
        let rolesActivated = false;
        const cachedServer = this.cache.cache.get(message.guild.id);
        if (cachedServer) {
          rolesActivated = cachedServer.rolesActivated;
        } else {
          try {
            const mongoose = await openMongoConnection();
            const server = await this.serverRepository.findOne({
              guildId: message.guild.id,
            });
            mongoose.connection.close();
            rolesActivated = server.rolesActivated;
          } catch (error) {
            return;
          }
        }

        if (rolesActivated) {
          const notAllowedPrefix = ['>', '#', '$', '!', ';', 'rpg'];
          if (
            !notAllowedPrefix.some((prefix) =>
              message.content.startsWith(prefix),
            )
          ) {
            let score = 0;

            const { content, author } = message;
            const messageWords = content.split(' ');
            const userRegex = /(<@![0-9]+>)/;

            // Give points to valid messages.
            const validWords = messageWords.filter(
              (word) => word.length >= 2 && !word.match(userRegex),
            ).length;
            if (validWords >= 3) {
              score += 3;
            }

            for (let i = 0; i < messageWords.length; i++) {
              const word = messageWords[i];
              // Give 1 point for user interaction
              if (word.match(userRegex)) {
                // <@! userId >
                const userId = word.substring(3, word.length - 1);
                try {
                  const user = await message.guild.members.fetch(userId);
                  if (user) {
                    score += 2;
                  }
                } catch (error) {
                  logger.error(
                    'There was a problem registering score from user interaction',
                    {
                      context: this.constructor.name,
                    },
                  );
                }
                break;
              }
            }

            try {
              const mongoose = await openMongoConnection();
              const user: DocumentType<DbUser> = await this.userRepository
                .findOne({ discordId: author.id })
                .exec();
              if (user) {
                user.participationScore += score;
                await user.save();
              } else {
                const newUser: DbUser = new DbUser(
                  author.id,
                  author.username,
                  0,
                  score,
                );
                await this.userRepository.create(newUser);
              }
              await mongoose.connection.close();

              const authorGuildMember = await message.guild.members.fetch(
                author.id,
              );
              defineRoles(user.participationScore, authorGuildMember, message);
            } catch (error) {
              logger.error(
                `MongoDB Connection error. Could not register ${author.username}'s words points`,
                {
                  context: this.constructor.name,
                },
              );
            }
          }
        }
      }
    });

    this.client.on('guildCreate', (guild) => {
      const channel = guild.channels.cache.find(
        (channel) =>
          channel.type === 'text' &&
          channel.permissionsFor(guild.me).has('SEND_MESSAGES'),
      );
      if (channel) {
        (channel as TextChannel).send(
          `Thanks for invite me to your server n.n please, first run the ${configuration.prefix}initialize command, I need it to work correctly (:`,
        );
      }
    });

    this.client.on('guildDelete', async (guild) => {
      const { id } = guild;
      try {
        logger.info(
          `Trying to leave '${guild.name}' server and delete from DB...`,
          {
            context: this.constructor.name,
          },
        );
        const mongoose = await openMongoConnection();
        await this.serverRepository.deleteOne({ guildId: id });
        await mongoose.connection.close();
        logger.info(`${guild.name} leaved and deleted succesfully`, {
          context: this.constructor.name,
        });
      } catch (error) {
        logger.error(
          `MongoDB Connection error. Could not delete '${guild.name}' server from DB`,
          {
            context: this.constructor.name,
          },
        );
      }
    });
  }
}

export const app: App = new App();
