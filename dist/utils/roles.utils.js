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
exports.initRoles = exports.roles = exports.defineRoles = void 0;
const discord_js_1 = require("discord.js");
const logger_1 = __importDefault(require("../logger"));
const configuration_1 = __importDefault(require("../config/configuration"));
const links_1 = require("./resources/links");
const roles = {
    ZOTE: {
        name: 'Zote',
        requiredPoints: 50,
    },
    FALSE_KNIGHT: {
        name: 'False Knight',
        requiredPoints: 250,
    },
    HORNET: {
        name: 'Hornet',
        requiredPoints: 500,
    },
    LOST_KIN: {
        name: 'Lost Kin',
        requiredPoints: 1000,
    },
    HIVE_KNIGHT: {
        name: 'Hive Knight',
        requiredPoints: 2000,
    },
    SOUL_MASTER: {
        name: 'Soul Master',
        requiredPoints: 3000,
    },
    WHITE_DEFENDER: {
        name: 'White Defender',
        requiredPoints: 5000,
    },
    GREAT_NAILSAGE_SLY: {
        name: 'Great Nailsage Sly',
        requiredPoints: 8000,
    },
    HOLLOW_KNIGHT: {
        name: 'Hollow Knight',
        requiredPoints: 12000,
    },
    THE_KNIGHT: {
        name: 'The Knight',
        requiredPoints: 17000,
    },
    NIGHTMARE_GRIMM: {
        name: 'Nightmare Grimm',
        requiredPoints: 23000,
    },
    PURE_VESSEL: {
        name: 'Pure Vessel',
        requiredPoints: 30000,
    },
    THE_ASCENDED_KNIGHT: {
        name: 'The Ascended Knight',
        requiredPoints: 50000,
    },
};
exports.roles = roles;
const ROLE_COLOR = configuration_1.default.embedMessageColor;
function defineRoles(participationPoints, user, message) {
    const userRoles = message.guild.members.cache.find((member) => member.id === message.author.id).roles.cache;
    const availableBotRoles = Object.values(roles);
    const botRolesExistingInUser = userRoles.filter((userRole) => availableBotRoles.find((role) => role.name === userRole.name) !==
        undefined);
    let nextAvailableRole;
    availableBotRoles.forEach((role) => {
        if (botRolesExistingInUser.find((botRole) => botRole.name === role.name)) {
            nextAvailableRole = role;
        }
    });
    if (nextAvailableRole &&
        participationPoints >= nextAvailableRole.requiredPoints) {
        const existingRoles = message.guild.roles.cache;
        const existingRoleInServer = existingRoles.find((role) => role.name === nextAvailableRole.name);
        if (existingRoleInServer) {
            const haveRole = user.roles.cache.get(existingRoleInServer.id);
            if (!haveRole) {
                applyRole(existingRoleInServer, user, message);
            }
        }
    }
}
exports.defineRoles = defineRoles;
function applyRole(role, user, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield user.roles.add(role);
            const embedMessage = new discord_js_1.MessageEmbed()
                .setColor(ROLE_COLOR)
                .setImage(links_1.links.upgradeRole)
                .setDescription(`Congratulations ${user}, you have obtain the '${role.name}' role!`);
            message.channel.send(embedMessage);
        }
        catch (error) {
            const errMessage = `Failed '${role.name}' role assignation. I think I need more permissions ):`;
            logger_1.default.error(errMessage, { context: this.constructor.name });
            message.channel.send(errMessage);
        }
    });
}
function initRoles(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { guild } = message;
            const everyRole = Object.values(roles);
            everyRole.forEach((role) => __awaiter(this, void 0, void 0, function* () {
                if (!guild.roles.cache.find((guildRole) => guildRole.name === role.name)) {
                    yield guild.roles.create({
                        data: {
                            name: role.name,
                            color: ROLE_COLOR,
                            mentionable: true,
                        },
                    });
                }
            }));
            return true;
        }
        catch (error) {
            logger_1.default.error(`Authorization error. Does not have enough permissions on ${message.guild.name} server`, { context: this.constructor.name });
        }
        return false;
    });
}
exports.initRoles = initRoles;
//# sourceMappingURL=roles.utils.js.map