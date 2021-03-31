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
const main_1 = require("../../main");
const configuration_1 = __importDefault(require("../../config/configuration"));
const roles_utils_1 = require("../../utils/roles.utils");
const mongo_1 = require("../../database/mongo");
const server_model_1 = __importDefault(require("../../database/models/server.model"));
const typegoose_1 = require("@typegoose/typegoose");
class RolesCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'roles',
            aliases: ['r'],
            group: 'roles',
            memberName: 'roles',
            description: `Shows every registered ${configuration_1.default.appName}'s roles`,
            args: [],
        });
        this.serverRepository = typegoose_1.getModelForClass(server_model_1.default);
    }
    run(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const activatedRolesError = `You have not activated ${configuration_1.default.appName}'s roles. First, you have to run ${configuration_1.default.prefix}activateroles.`;
            const cachedServer = main_1.app.cache.cache.get(message.guild.id);
            if (!(cachedServer === null || cachedServer === void 0 ? void 0 : cachedServer.rolesActivated)) {
                return message.say(activatedRolesError);
            }
            try {
                const mongoose = yield mongo_1.openMongoConnection();
                const server = yield this.serverRepository.findOne({
                    guildId: message.guild.id,
                });
                mongoose.connection.close();
                if (server.rolesActivated) {
                    return message.say(activatedRolesError);
                }
            }
            catch (error) {
                return message.say('It occured an unexpected error :sweat: try again later.');
            }
            const embedMessage = new discord_js_1.MessageEmbed()
                .setColor(configuration_1.default.embedMessageColor)
                .setDescription(`:jack_o_lantern: Available ${configuration_1.default.appName}'s Roles :jack_o_lantern:`);
            let rolesList = '';
            let scoresList = '';
            const availableRoles = Object.values(roles_utils_1.roles);
            availableRoles.forEach((role) => {
                rolesList += `• ${role.name} \n`;
                scoresList += `${role.requiredPoints} \n`;
            });
            embedMessage.addField('Roles', rolesList, true);
            embedMessage.addField('Required scores', scoresList, true);
            embedMessage.setFooter('You can increase your score being participatory and interacting with other users n.n');
            return message.say(embedMessage);
        });
    }
}
exports.default = RolesCommand;
//# sourceMappingURL=roles.js.map