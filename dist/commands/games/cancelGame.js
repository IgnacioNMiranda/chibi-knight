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
const logger_1 = __importDefault(require("../../logger"));
const main_1 = require("../../main");
class CancelGameCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'cancelgame',
            aliases: ['cg'],
            group: 'games',
            memberName: 'cancelgame',
            description: 'Cancels the active game.',
            args: [],
        });
    }
    run(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = message.guild;
            const cachedGuild = main_1.app.cache.getGuildById(id);
            if (cachedGuild) {
                if (!cachedGuild.gameInstanceActive) {
                    return message.say("There's no active game.");
                }
                cachedGuild.gameInstanceActive = false;
                main_1.app.cache.setGuildById(id, cachedGuild);
            }
            try {
                const guild = yield main_1.app.guildService.getById(id);
                if (!guild.gameInstanceActive) {
                    return message.say("There's no active game.");
                }
                else {
                    guild.gameInstanceActive = false;
                    yield guild.save();
                    const { guildId, rolesActivated, gameInstanceActive } = guild;
                    const cached = {
                        guildId,
                        rolesActivated,
                        gameInstanceActive,
                    };
                    main_1.app.cache.setGuildById(guildId, cached);
                    return message.say('Game cancelled.');
                }
            }
            catch (error) {
                logger_1.default.error(`MongoDB Connection error. Could not change game instance state for '${message.guild.name}' server`, {
                    context: this.constructor.name,
                });
            }
            if (cachedGuild) {
                return message.say('Game cancelled.');
            }
            else {
                return message.say('It occured an unexpected error :sweat: try again later.');
            }
        });
    }
}
exports.default = CancelGameCommand;
//# sourceMappingURL=cancelGame.js.map