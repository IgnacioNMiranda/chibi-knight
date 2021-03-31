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
const logger_1 = __importDefault(require("../logger"));
const server_model_1 = __importDefault(require("./models/server.model"));
const mongo_1 = require("./mongo");
class Cache {
    constructor() {
        this.serverRepository = typegoose_1.getModelForClass(server_model_1.default);
        this.cache = new Map();
        this.initCache();
    }
    initCache() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongoose = yield mongo_1.openMongoConnection();
                const servers = yield this.serverRepository.find();
                servers.forEach((server) => {
                    const serverDto = {
                        guildId: server.guildId,
                        rolesActivated: server.rolesActivated,
                        gameInstanceActive: server.gameInstanceActive,
                    };
                    this.cache.set(server.guildId, serverDto);
                });
                yield mongoose.connection.close();
            }
            catch (error) {
                logger_1.default.error(`MongoDB Connection error. Could not init cache from database`, {
                    context: this.constructor.name,
                });
            }
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cache = new Map();
        });
    }
    getGameInstanceActive(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedServerInstance = this.cache.get(message.guild.id);
            if (cachedServerInstance) {
                return cachedServerInstance.gameInstanceActive;
            }
            else {
                try {
                    const mongoose = yield mongo_1.openMongoConnection();
                    const server = yield this.serverRepository.findOne({
                        guildId: message.guild.id,
                    });
                    yield mongoose.connection.close();
                    return server.gameInstanceActive;
                }
                catch (error) {
                    logger_1.default.error(`MongoDB Connection error. Could not retrieve gameInstanceActive for '${message.guild.name}' server`, {
                        context: this.constructor.name,
                    });
                    throw new Error(error);
                }
            }
        });
    }
}
exports.default = Cache;
//# sourceMappingURL=Cache.js.map