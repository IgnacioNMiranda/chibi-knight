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
const configuration_1 = __importDefault(require("../../config/configuration"));
const roles_utils_1 = require("../../utils/roles.utils");
const main_1 = require("../../main");
class MyRolesCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'myroles',
            aliases: ['mr'],
            group: 'roles',
            memberName: 'myroles',
            description: `Shows user's roles and their score.`,
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
            const { author: { id }, } = message;
            const userRoles = message.guild.members.cache.find((member) => member.id === id).roles.cache;
            let rolesList = '';
            let nextAvailableRole;
            const rolesArray = Object.values(roles_utils_1.roles);
            rolesArray.forEach((role, idx) => {
                if (userRoles.find((userRole) => userRole.name === role.name)) {
                    rolesList += `• ${role.name} \n`;
                    if (idx != rolesArray.length - 1) {
                        nextAvailableRole = rolesArray[idx + 1];
                    }
                }
            });
            let score = 'Who knows D:';
            try {
                const user = yield main_1.app.userService.getById(id);
                const guildData = user.guildsData.find((guildData) => guildData.guildId === guildId);
                score = guildData.participationScore.toString();
            }
            catch (error) { }
            const embedMessage = new discord_js_1.MessageEmbed()
                .setColor(configuration_1.default.embedMessageColor)
                .setDescription(`${message.author.username}'s Roles`);
            if (rolesList) {
                embedMessage.addField('You have the following roles:', rolesList);
            }
            else {
                embedMessage.addField(`You don't have any role`, 'Try to be more participatory n.n');
            }
            embedMessage.addField('Current Score', score);
            if (nextAvailableRole) {
                if (nextAvailableRole.name !== rolesArray[rolesArray.length - 1].name) {
                    embedMessage.setFooter(`You need ${nextAvailableRole.requiredPoints - parseInt(score)} points to get '${nextAvailableRole.name}' role.`);
                }
                else {
                    embedMessage.setFooter(`You are an ${rolesArray[rolesArray.length - 1].name}, you have reached supremacy!!`);
                }
            }
            else {
                embedMessage.setFooter(`You need a total amount of ${rolesArray[0].requiredPoints - parseInt(score)} points to get '${rolesArray[0].name}' role.`);
            }
            return message.say(embedMessage);
        });
    }
}
exports.default = MyRolesCommand;
//# sourceMappingURL=myRoles.js.map