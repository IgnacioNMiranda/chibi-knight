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
const server_model_1 = __importDefault(require("../../database/models/server.model"));
const typegoose_1 = require("@typegoose/typegoose");
const mongo_1 = require("../../database/mongo");
class InitChibiKnightCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'initialize',
            aliases: ['i'],
            group: 'misc',
            memberName: 'initialize',
            description: 'Initialize Chibi Knight funcionalities.',
            hidden: true,
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
                if (!server) {
                    logger_1.default.info(`Trying to register new server ${message.guild.name}...`, {
                        context: this.constructor.name,
                    });
                    const newServer = { guildId: message.guild.id };
                    yield this.serverRepository.create(newServer);
                    yield mongoose.connection.close();
                    logger_1.default.info(`${message.guild.name} registered succesfully`, {
                        context: this.constructor.name,
                    });
                    return message.say(`${configuration_1.default.appName} has been initialize successfully :purple_heart: check out the commands with ${configuration_1.default.prefix}help :smile:`);
                }
                else {
                    return message.say(`${configuration_1.default.appName} has already been initialize n.n`);
                }
            }
            catch (error) {
                return message.say(`It occured an unexpected error while trying to initialize ${configuration_1.default.appName} :sweat: try again later.`);
            }
        });
    }
}
exports.default = InitChibiKnightCommand;
//# sourceMappingURL=initChibiKnight.js.map