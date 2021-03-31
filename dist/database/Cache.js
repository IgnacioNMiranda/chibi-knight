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
const main_1 = require("../main");
const logger_1 = __importDefault(require("../logger"));
class Cache {
    constructor() {
        this.cache = new Map();
    }
    initCache() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cache) {
                return this.cache;
            }
            try {
                logger_1.default.info('Trying to init cache...', {
                    context: this.constructor.name,
                });
                const guilds = yield main_1.app.guildService.getAll();
                guilds.forEach((guild) => {
                    const { guildId, rolesActivated, gameInstanceActive } = guild;
                    const cachedGuild = {
                        guildId,
                        rolesActivated,
                        gameInstanceActive,
                    };
                    this.setGuildById(guildId, cachedGuild);
                });
            }
            catch (error) {
                logger_1.default.error(`MongoDB Connection error. Could not init cache from database`, {
                    context: this.constructor.name,
                });
            }
            return this.cache;
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache = new Map();
        });
    }
    getGuildById(guildId) {
        return this.cache.get(guildId);
    }
    setGuildById(guildId, guild) {
        return this.cache.set(guildId, guild);
    }
    getGameInstanceActive(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: guildId } = message.guild;
            const cachedGuild = this.getGuildById(guildId);
            if (cachedGuild) {
                return cachedGuild.gameInstanceActive;
            }
            else {
                try {
                    const guild = yield main_1.app.guildService.getById(guildId);
                    return guild.gameInstanceActive;
                }
                catch (error) {
                    logger_1.default.error(`MongoDB Connection error. Could not retrieve gameInstanceActive for '${message.guild.name}' server`, {
                        context: this.constructor.name,
                    });
                    throw error;
                }
            }
        });
    }
}
exports.default = Cache;
//# sourceMappingURL=Cache.js.map