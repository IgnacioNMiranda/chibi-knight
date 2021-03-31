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
exports.MongoConnection = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const configuration_1 = __importDefault(require("../config/configuration"));
class MongoConnection {
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.mongo) {
                return this.mongo;
            }
            try {
                this.mongo = yield typegoose_1.mongoose.connect(configuration_1.default.mongodb.connection_url, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useCreateIndex: true,
                    serverSelectionTimeoutMS: 4000,
                });
                return this.mongo;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.MongoConnection = MongoConnection;
//# sourceMappingURL=mongo.js.map