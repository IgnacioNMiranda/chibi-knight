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
        this.userRepository = typegoose_1.getModelForClass(index_1.User);
    }
    create(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongo = yield main_1.app.mongoConnection.connect();
                if (mongo) {
                    return this.userRepository.create(user);
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
                    return this.userRepository.find().exec();
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    getByFilter(filter, limit = 10, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongo = yield main_1.app.mongoConnection.connect();
                if (mongo) {
                    return this.userRepository.find(filter).limit(limit).sort(sort).exec();
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    getByNestedFilter(unwind, filter, limit = 10, sort) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongo = yield main_1.app.mongoConnection.connect();
                if (mongo) {
                    return yield this.userRepository.aggregate([
                        { $unwind: `$${unwind}` },
                        { $match: filter },
                        { $sort: sort },
                        { $limit: limit },
                    ]);
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    getById(discordUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongo = yield main_1.app.mongoConnection.connect();
                if (mongo) {
                    return this.userRepository.findOne({ discordId: discordUserId }).exec();
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    deleteById(discordUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongo = yield main_1.app.mongoConnection.connect();
                if (mongo) {
                    return this.userRepository
                        .deleteOne({ discordId: discordUserId })
                        .exec();
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = UserService;
//# sourceMappingURL=user.service.js.map