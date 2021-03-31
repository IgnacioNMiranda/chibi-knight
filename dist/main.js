"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const path_1 = __importDefault(require("path"));
const configuration_1 = __importDefault(require("./config/configuration"));
const discord_js_commando_1 = require("discord.js-commando");
const logger_1 = __importDefault(require("./logger"));
const typegoose_1 = require("@typegoose/typegoose");
const user_model_1 = __importDefault(require("./database/models/user.model"));
const roles_utils_1 = require("./utils/roles.utils");
const server_model_1 = __importDefault(require("./database/models/server.model"));
const Cache_1 = __importDefault(require("./database/Cache"));
const mongo_1 = require("./database/mongo");
class App {
    constructor() {
        this.userRepository = typegoose_1.getModelForClass(user_model_1.default);
        this.serverRepository = typegoose_1.getModelForClass(server_model_1.default);
        this.initClient();
    }
    initClient() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client = new discord_js_commando_1.CommandoClient({
                commandPrefix: configuration_1.default.prefix,
                owner: configuration_1.default.clientId,
                invite: '',
            });
            this.client.registry.registerDefaultTypes().registerGroups([
                ['games', 'Games commands'],
                ['misc', 'Miscellaneous commands'],
                ['music', 'Music commands'],
                ['roles', 'Roles commands'],
            ]);
            if (configuration_1.default.env === 'development') {
                this.client.registry.registerCommandsIn({
                    filter: /^([^.].*)\.ts$/,
                    dirname: path_1.default.join(__dirname, './commands'),
                });
            }
            else {
                this.client.registry.registerCommandsIn({
                    filter: /^([^.].*)\.js$/,
                    dirname: path_1.default.join(__dirname, './commands'),
                });
            }
            this.registerEvents();
            try {
                logger_1.default.info('Logging in...', {
                    context: this.constructor.name,
                });
                yield this.client.login(configuration_1.default.token);
                this.cache = new Cache_1.default();
                setTimeout(this.cache.refresh, 1000 * 60 * 60);
            }
            catch (error) {
                const { code, method, path } = error;
                console.error(`Error ${code} trying to ${method} to ${path} path`);
            }
        });
    }
    registerEvents() {
        this.client.once('ready', () => {
            this.client.user.setActivity(`${configuration_1.default.prefix}help`);
            logger_1.default.info(`${this.client.user.username} is online n.n`, {
                context: this.constructor.name,
            });
        });
        this.client.on('error', console.error).on('warn', console.warn);
        this.client.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            if (!message.author.bot) {
                let rolesActivated = false;
                const cachedServer = this.cache.cache.get(message.guild.id);
                if (cachedServer) {
                    rolesActivated = cachedServer.rolesActivated;
                }
                else {
                    try {
                        const mongoose = yield mongo_1.openMongoConnection();
                        const server = yield this.serverRepository.findOne({
                            guildId: message.guild.id,
                        });
                        mongoose.connection.close();
                        rolesActivated = server.rolesActivated;
                    }
                    catch (error) {
                        return;
                    }
                }
                if (rolesActivated) {
                    const notAllowedPrefix = ['>', '#', '$', '!', ';', 'rpg'];
                    if (!notAllowedPrefix.some((prefix) => message.content.startsWith(prefix))) {
                        let score = 0;
                        const { content, author } = message;
                        const messageWords = content.split(' ');
                        const userRegex = /(<@![0-9]+>)/;
                        const validWords = messageWords.filter((word) => word.length >= 2 && !word.match(userRegex)).length;
                        if (validWords >= 3) {
                            score += 3;
                        }
                        for (let i = 0; i < messageWords.length; i++) {
                            const word = messageWords[i];
                            if (word.match(userRegex)) {
                                const userId = word.substring(3, word.length - 1);
                                try {
                                    const user = yield message.guild.members.fetch(userId);
                                    if (user) {
                                        score += 2;
                                    }
                                }
                                catch (error) {
                                    logger_1.default.error('There was a problem registering score from user interaction', {
                                        context: this.constructor.name,
                                    });
                                }
                                break;
                            }
                        }
                        try {
                            const mongoose = yield mongo_1.openMongoConnection();
                            const user = yield this.userRepository
                                .findOne({ discordId: author.id })
                                .exec();
                            if (user) {
                                user.participationScore += score;
                                yield user.save();
                            }
                            else {
                                const newUser = new user_model_1.default(author.id, author.username, 0, score);
                                yield this.userRepository.create(newUser);
                            }
                            yield mongoose.connection.close();
                            const authorGuildMember = yield message.guild.members.fetch(author.id);
                            roles_utils_1.defineRoles(user.participationScore, authorGuildMember, message);
                        }
                        catch (error) {
                            logger_1.default.error(`MongoDB Connection error. Could not register ${author.username}'s words points`, {
                                context: this.constructor.name,
                            });
                        }
                    }
                }
            }
        }));
        this.client.on('guildCreate', (guild) => {
            const channel = guild.channels.cache.find((channel) => channel.type === 'text' &&
                channel.permissionsFor(guild.me).has('SEND_MESSAGES'));
            if (channel) {
                channel.send(`Thanks for invite me to your server n.n please, first run the ${configuration_1.default.prefix}initialize command, I need it to work correctly (:`);
            }
        });
        this.client.on('guildDelete', (guild) => __awaiter(this, void 0, void 0, function* () {
            const { id } = guild;
            try {
                logger_1.default.info(`Trying to leave '${guild.name}' server and delete from DB...`, {
                    context: this.constructor.name,
                });
                const mongoose = yield mongo_1.openMongoConnection();
                yield this.serverRepository.deleteOne({ guildId: id });
                yield mongoose.connection.close();
                logger_1.default.info(`${guild.name} leaved and deleted succesfully`, {
                    context: this.constructor.name,
                });
            }
            catch (error) {
                logger_1.default.error(`MongoDB Connection error. Could not delete '${guild.name}' server from DB`, {
                    context: this.constructor.name,
                });
            }
        }));
    }
}
exports.app = new App();
//# sourceMappingURL=main.js.map