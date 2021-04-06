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
const discord_js_commando_1 = require("discord.js-commando");
const configuration_1 = __importDefault(require("../../config/configuration"));
const logger_1 = __importDefault(require("../../logger"));
const main_1 = require("../../main");
class InitChibiKnightCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'init',
            aliases: ['i'],
            group: 'misc',
            memberName: 'init',
            description: 'Initialize Chibi Knight funcionalities.',
            hidden: true,
        });
    }
    run(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield message.guild.members.fetch(message.author.id);
                if (!user.hasPermission('ADMINISTRATOR')) {
                    return message.say(`You don't have permissions to run this command. Contact with an Administrator :sweat:`);
                }
                const { id: guildId, members } = message.guild;
                const guild = yield main_1.app.guildService.getById(guildId);
                if (!guild) {
                    logger_1.default.info(`Trying to register new server '${message.guild.name}'...`, {
                        context: this.constructor.name,
                    });
                    const newGuild = { guildId };
                    yield main_1.app.guildService.create(newGuild);
                    logger_1.default.info(`'${message.guild.name}' guild registered succesfully`, {
                        context: this.constructor.name,
                    });
                    const guildMembers = yield members.fetch();
                    guildMembers.forEach(({ user }) => __awaiter(this, void 0, void 0, function* () {
                        if (!user.bot) {
                            const guildData = { guildId };
                            const bdUser = yield main_1.app.userService.getById(user.id);
                            if (bdUser) {
                                if (!bdUser.guildsData.find((guildData) => guildData.guildId === guildId)) {
                                    bdUser.guildsData.push(guildData);
                                    yield bdUser.save();
                                }
                            }
                            else {
                                const newUser = {
                                    discordId: user.id,
                                    name: user.username,
                                    guildsData: [guildData],
                                };
                                yield main_1.app.userService.create(newUser);
                            }
                        }
                    }));
                    logger_1.default.info(`'${message.guild.name}' users has been registered succesfully`, {
                        context: this.constructor.name,
                    });
                    return message.say(`${configuration_1.default.appName} has been initialize successfully :purple_heart: check out the commands with **${configuration_1.default.prefix}help** :smile:`);
                }
                else {
                    return message.say(`${configuration_1.default.appName} has already been initialize n.n`);
                }
            }
            catch (error) {
                logger_1.default.error(error, { context: this.constructor.name });
                return message.say(`It occured an unexpected error while trying to initialize ${configuration_1.default.appName} :sweat: try again later.`);
            }
        });
    }
}
exports.default = InitChibiKnightCommand;
//# sourceMappingURL=initChibiKnight.js.map