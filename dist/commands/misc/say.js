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
const discord_js_commando_1 = require("discord.js-commando");
const logger_1 = __importDefault(require("../../logger"));
class SayCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'say',
            aliases: ['s'],
            group: 'misc',
            memberName: 'say',
            description: 'Replies with the received message.',
            args: [
                {
                    key: 'receivedMessage',
                    prompt: 'What text would you like the bot to say?',
                    type: 'string',
                },
            ],
        });
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield message.say(args.receivedMessage);
                yield message.delete();
            }
            catch (error) {
                logger_1.default.error(error, {
                    context: this.constructor.name,
                });
            }
            return;
        });
    }
}
exports.default = SayCommand;
//# sourceMappingURL=say.js.map