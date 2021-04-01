"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typegoose_1 = require("@typegoose/typegoose");
const guildData_model_1 = __importDefault(require("./guildData.model"));
let User = class User {
};
__decorate([
    typegoose_1.prop(String),
    __metadata("design:type", String)
], User.prototype, "discordId", void 0);
__decorate([
    typegoose_1.prop(String),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    typegoose_1.prop({
        type: [guildData_model_1.default],
    }),
    __metadata("design:type", Array)
], User.prototype, "guildsData", void 0);
User = __decorate([
    typegoose_1.index({ discordId: 'text' }, { weights: { discordId: 1 } })
], User);
exports.default = User;
//# sourceMappingURL=user.model.js.map