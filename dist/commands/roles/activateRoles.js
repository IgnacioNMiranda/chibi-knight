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
const typegoose_1 = require("@typegoose/typegoose");
const discord_js_1 = require("discord.js");
const discord_js_commando_1 = require("discord.js-commando");
const logger_1 = __importDefault(require("../../logger"));
const server_model_1 = __importDefault(require("../../database/models/server.model"));
const mongo_1 = require("../../database/mongo");
const main_1 = require("../../main");
const configuration_1 = __importDefault(require("../../config/configuration"));
const roles_utils_1 = require("../../utils/roles.utils");
class ActivateRolesCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'activateroles',
            aliases: ['ar'],
            group: 'roles',
            memberName: 'activateroles',
            description: 'Activates bot roles.',
            args: [],
        });
        this.serverRepository = typegoose_1.getModelForClass(server_model_1.default);
    }
    run(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cachedServer = main_1.app.cache.cache.get(message.guild.id);
                if (cachedServer === null || cachedServer === void 0 ? void 0 : cachedServer.rolesActivated) {
                    return message.say(`You already have initialize ${configuration_1.default.appName}'s roles :relieved:`);
                }
                const mongoose = yield mongo_1.openMongoConnection();
                const server = yield this.serverRepository.findOne({
                    guildId: message.guild.id,
                });
                if (server === null || server === void 0 ? void 0 : server.rolesActivated) {
                    return message.say(`You already have initialize ${configuration_1.default.appName}'s roles :relieved:`);
                }
                else {
                    let rolesList = '';
                    const everyRole = Object.values(roles_utils_1.roles);
                    everyRole.forEach((role) => {
                        rolesList += `• ${role.name} \n`;
                    });
                    const embedMessage = new discord_js_1.MessageEmbed()
                        .attachFiles(['./public/img/chibiKnightLogo.png'])
                        .setAuthor('Chibi Knight', 'attachment://chibiKnightLogo.png')
                        .setThumbnail('attachment://chibiKnightLogo.png')
                        .addField('The next roles will be added to your server:', rolesList)
                        .setColor(configuration_1.default.embedMessageColor)
                        .setFooter(`Do you really want to activate ${configuration_1.default.appName}'s roles ? (yes/y/no/n)`);
                    yield message.say(embedMessage);
                    const filter = (response) => {
                        return response.author.id === message.author.id;
                    };
                    const collectedMessages = yield message.channel.awaitMessages(filter, {
                        max: 1,
                        time: 15000,
                    });
                    if (collectedMessages === null || collectedMessages === void 0 ? void 0 : collectedMessages.first()) {
                        const receivedResponse = collectedMessages.first().content;
                        if (receivedResponse === 'yes' || receivedResponse === 'y') {
                            yield message.say(`Okay, we're working for you, meanwhile take a nap n.n`);
                            const created = yield roles_utils_1.initRoles(message);
                            if (created) {
                                server.rolesActivated = true;
                                yield server.save();
                                yield mongoose.connection.close();
                                const cachedServer = {
                                    guildId: message.guild.id,
                                    gameInstanceActive: server.gameInstanceActive,
                                    rolesActivated: true,
                                };
                                main_1.app.cache.cache.set(message.guild.id, cachedServer);
                                return message.say(`That was hard :smiling_face_with_tear: Roles created successfully :purple_heart: Try to see yours with ${configuration_1.default.prefix}roles command.`);
                            }
                            else {
                                return message.say(`Error while trying to create roles, maybe I don't have enough permissions :sweat:`);
                            }
                        }
                        else {
                            return message.say('Roger!');
                        }
                    }
                    else {
                        return message.say(`Time's up! Try again later ):`);
                    }
                }
            }
            catch (error) {
                console.log(error);
                logger_1.default.error(`MongoDB Connection error. Could not initiate roles game for '${message.guild.name}' server`, { context: this.constructor.name });
                return message.say('It occured an unexpected error, roles could not be created ): Try again later :sweat:');
            }
        });
    }
}
exports.default = ActivateRolesCommand;
//# sourceMappingURL=activateRoles.js.map