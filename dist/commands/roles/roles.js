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
    }
    run(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const activatedRolesError = `${configuration_1.default.appName}'s roles are not activated. First, you have to run ${configuration_1.default.prefix}activateroles.`;
            const { id: guildId } = message.guild;
            const cachedGuild = main_1.app.cache.getGuildById(guildId);
            if (cachedGuild && !cachedGuild.rolesActivated) {
                return message.say(activatedRolesError);
            }
            try {
                const guild = yield main_1.app.guildService.getById(guildId);
                if (guild && !guild.rolesActivated) {
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