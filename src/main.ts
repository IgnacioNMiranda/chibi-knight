import pathlib from 'path';
import { configuration } from './config/configuration';
import { CommandoClient } from 'discord.js-commando';
import { logger } from './logger';
import { DocumentType } from '@typegoose/typegoose';
import DbUser from './database/models/user.model';
import { RoleUtil } from './utils/index';
import Cache from './database/Cache';
import { MongoConnection } from './database/Mongo';
import { TextChannel } from 'discord.js';
import { GuildService, UserService } from './database/services/index';
import GuildData from './database/models/guildData.model';

class App {
  // Instance of the bot client.
  client: CommandoClient;

  // MongoDB connection instance.
  mongoConnection: MongoConnection;

  // Services.
  guildService: GuildService;
  userService: UserService;

  cache: Cache;

  constructor() {
    this.initApplication();
  }

  async initApplication() {
    logger.info('Initializing application...', {
      context: this.constructor.name,
    });
    await this.initMongoConnection();
    this.initServices();
    await this.initClient();
  }

  async initMongoConnection() {
    logger.info('Trying to connect to mongo database...', {
      context: this.constructor.name,
    });
    this.mongoConnection = new MongoConnection();
    try {
      this.cache = new Cache();
      await this.mongoConnection.connect();

      await this.cache.initCache();
      setTimeout(this.cache.refresh, 1000 * 60 * 60);
    } catch (error) {
      logger.error(`MongoDB Connection error. Could not connect to database`, {
        context: this.constructor.name,
      });
    }
  }

  initServices() {
    this.guildService = new GuildService();
    this.userService = new UserService();
  }

  async initClient() {
    logger.info('Trying to initialize client...', {
      context: this.constructor.name,
    });
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
      const notAllowedPrefix = ['>', '#', '$', '!', ';', 'rpg'];
      const { content, author, guild } = message;

      if (
        author.bot ||
        content.startsWith(configuration.prefix) ||
        guild === null ||
        notAllowedPrefix.some((prefix) => content.startsWith(prefix))
      ) {
        return;
      }

      const { id: guildId } = guild;
      let rolesActivated = false;
      const cachedGuild = this.cache.get(guildId);
      if (cachedGuild) {
        rolesActivated = cachedGuild.rolesActivated;
      } else {
        try {
          const guild = await this.guildService.getById(guildId);
          rolesActivated = guild.rolesActivated;
        } catch (error) {}
      }

      if (!rolesActivated) {
        return;
      }

      const messageWords = content.split(' ');
      const userRegex = /(<@![0-9]+>)/;

      // Give points to valid messages.
      let score = 0;
      const validWords = messageWords.filter(
        (word) => word.length >= 2 && !word.match(userRegex),
      ).length;
      if (validWords >= 3) {
        score += 3;
      }

      messageWords.some(async (word: string) => {
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
          return;
        }
      });

      try {
        const user: DocumentType<DbUser> = await this.userService.getById(
          author.id,
        );

        let finalParticipationScore = score;
        if (user) {
          const guildDataIdx = user.guildsData.findIndex(
            (guildData) => guildData.guildId === guildId,
          );
          user.guildsData[guildDataIdx].participationScore += score;
          finalParticipationScore =
            user.guildsData[guildDataIdx].participationScore;
          await user.save();
        } else {
          const guildData: GuildData = {
            guildId,
            participationScore: score,
          };
          const newUser: DbUser = {
            discordId: author.id,
            name: author.username,
            guildsData: [guildData],
          };
          await this.userService.create(newUser);
        }

        const authorGuildMember = await message.guild.members.fetch(author.id);
        RoleUtil.defineRoles(
          finalParticipationScore,
          authorGuildMember,
          message,
        );
      } catch (error) {
        logger.error(
          `MongoDB Connection error. Could not register ${author.username}'s words points`,
          {
            context: this.constructor.name,
          },
        );
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
          `Thanks for invite me to your server n.n please, first run the **${configuration.prefix}init** command, I need it to work correctly (:`,
        );
      }
    });

    this.client.on('guildDelete', async (guild) => {
      const { id: guildId } = guild;
      try {
        logger.info(
          `Trying to leave '${guild.name}' server and delete from DB...`,
          {
            context: this.constructor.name,
          },
        );
        await this.guildService.deleteById(guildId);
        await this.userService.deleteGuildDataById(guildId);
        if (guild.me.permissions.has('MANAGE_ROLES')) {
          await RoleUtil.removeRoles(guild);
        }
        logger.info(`'${guild.name}' leaved and deleted succesfully`, {
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
