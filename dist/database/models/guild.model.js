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
Object.defineProperty(exports, "__esModule", { value: true });
const typegoose_1 = require("@typegoose/typegoose");
let Guild = class Guild {
};
__decorate([
    typegoose_1.prop({
        type: String,
    }),
    __metadata("design:type", String)
], Guild.prototype, "guildId", void 0);
__decorate([
    typegoose_1.prop({
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], Guild.prototype, "rolesActivated", void 0);
__decorate([
    typegoose_1.prop({
        type: Boolean,
        default: false,
    }),
    __metadata("design:type", Boolean)
], Guild.prototype, "gameInstanceActive", void 0);
Guild = __decorate([
    typegoose_1.index({ guildId: 'text' }, { weights: { guildId: 1 } })
], Guild);
exports.default = Guild;
//# sourceMappingURL=guild.model.js.map