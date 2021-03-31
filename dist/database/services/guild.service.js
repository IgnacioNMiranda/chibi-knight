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
Object.defineProperty(exports, "__esModule", { value: true });
const typegoose_1 = require("@typegoose/typegoose");
const main_1 = require("../../main");
const index_1 = require("../models/index");
class UserService {
    constructor() {
        this.guildRepository = typegoose_1.getModelForClass(index_1.Guild);
    }
    create(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongo = yield main_1.app.mongoConnection.connect();
                if (mongo) {
                    return this.guildRepository.create(guild);
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongo = yield main_1.app.mongoConnection.connect();
                if (mongo) {
                    return this.guildRepository.find().exec();
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    getById(guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongo = yield main_1.app.mongoConnection.connect();
                if (mongo) {
                    return this.guildRepository.findOne({ guildId }).exec();
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    deleteById(guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongo = yield main_1.app.mongoConnection.connect();
                if (mongo) {
                    return this.guildRepository.deleteOne({ guildId }).exec();
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = UserService;
//# sourceMappingURL=guild.service.js.map