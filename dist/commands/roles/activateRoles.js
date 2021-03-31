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
const discord_js_1 = require("discord.js");
const discord_js_commando_1 = require("discord.js-commando");
const logger_1 = __importDefault(require("../../logger"));
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
        });
    }
    run(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield message.guild.members.fetch(message.author.id);
                if (!user.hasPermission('ADMINISTRATOR')) {
                    return message.say(`You don't have permissions to run this command. Contact with an Administrator :sweat:`);
                }
                const { id: guildId } = message.guild;
                const activatedRolesError = `You already have initialize ${configuration_1.default.appName}'s roles :relieved:`;
                const cachedGuild = main_1.app.cache.getGuildById(guildId);
                if (cachedGuild === null || cachedGuild === void 0 ? void 0 : cachedGuild.rolesActivated) {
                    return message.say(activatedRolesError);
                }
                const guild = yield main_1.app.guildService.getById(guildId);
                if (guild) {
                    if (guild.rolesActivated) {
                        return message.say(activatedRolesError);
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
                                    guild.rolesActivated = true;
                                    yield guild.save();
                                    const cachedGuild = {
                                        guildId: message.guild.id,
                                        gameInstanceActive: guild.gameInstanceActive,
                                        rolesActivated: true,
                                    };
                                    main_1.app.cache.setGuildById(message.guild.id, cachedGuild);
                                    return message.say(`Roles created successfully :purple_heart: Try to see yours with ${configuration_1.default.prefix}roles command.`);
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
                else {
                    return message.say(`You have not run ${configuration_1.default.prefix}initialize command. You cannot activate roles before that.`);
                }
            }
            catch (error) {
                logger_1.default.error(`MongoDB Connection error. Could not initiate roles game for '${message.guild.name}' server`, { context: this.constructor.name });
                return message.say('It occured an unexpected error, roles could not be created ): Try again later :sweat:');
            }
        });
    }
}
exports.default = ActivateRolesCommand;
//# sourceMappingURL=activateRoles.js.map