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
const discord_js_commando_1 = require("discord.js-commando");
const logger_1 = __importDefault(require("../../logger"));
const server_model_1 = __importDefault(require("../../database/models/server.model"));
const mongo_1 = require("../../database/mongo");
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
        this.serverRepository = typegoose_1.getModelForClass(server_model_1.default);
    }
    run(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongoose = yield mongo_1.openMongoConnection();
                const server = yield this.serverRepository.findOne({
                    guildId: message.guild.id,
                });
                if (!server.gameInstanceActive) {
                    yield mongoose.connection.close();
                    return message.say("There's no active game.");
                }
                else {
                    server.gameInstanceActive = false;
                    yield server.save();
                    yield mongoose.connection.close();
                }
            }
            catch (error) {
                logger_1.default.error(`MongoDB Connection error. Could not change game instance active for '${message.guild.name}' server`, {
                    context: this.constructor.name,
                });
            }
            const cachedServer = main_1.app.cache.cache.get(message.guild.id);
            if (cachedServer) {
                if (!cachedServer.gameInstanceActive) {
                    return message.say("There's no active game.");
                }
                cachedServer.gameInstanceActive = false;
                main_1.app.cache.cache.set(message.guild.id, cachedServer);
            }
            return message.say('Game cancelled.');
        });
    }
}
exports.default = CancelGameCommand;
//# sourceMappingURL=cancelGame.js.map