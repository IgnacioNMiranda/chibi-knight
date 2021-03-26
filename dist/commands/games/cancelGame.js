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
const discord_js_commando_1 = require("discord.js-commando");
const main_1 = require("../../main");
class CancelGameCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'cancelgame',
            aliases: ['cg'],
            group: 'games',
            memberName: 'cancelgame',
            description: 'Cancels the active game.',
            args: [],
        });
    }
    run(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (main_1.app.gameInstanceActive) {
                main_1.app.gameInstanceActive = false;
                yield message.say('Game cancelled.');
            }
            else {
                yield message.say("There's no active game.");
            }
            return;
        });
    }
}
exports.default = CancelGameCommand;
//# sourceMappingURL=cancelGame.js.map