"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openMongoConnection = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const configuration_1 = __importDefault(require("../config/configuration"));
function openMongoConnection() {
    return typegoose_1.mongoose.connect(configuration_1.default.mongodb.connection_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    });
}
exports.openMongoConnection = openMongoConnection;
//# sourceMappingURL=mongo.js.map