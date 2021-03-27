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
const discord_js_1 = require("discord.js");
const links_1 = require("./resources/links");
const configuration_1 = __importDefault(require("../../config/configuration"));
const logger_1 = __importDefault(require("../../logger"));
class CongratulateCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'congratulate',
            aliases: ['c'],
            group: 'misc',
            memberName: 'congratulate',
            description: 'Congratulates some @User.',
            args: [
                {
                    key: 'congratulatedPerson',
                    prompt: 'Who do you want to congratulate?',
                    type: 'user',
                },
            ],
        });
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const gifs = links_1.links[0].gifs;
            const randIndex = Math.floor(Math.random() * gifs.length);
            const embedMessage = new discord_js_1.MessageEmbed()
                .setDescription(`Congratulations ${args.congratulatedPerson.username} !!`)
                .setColor(configuration_1.default.embedMessageColor)
                .setImage(gifs[randIndex]);
            try {
                yield message.say(embedMessage);
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
exports.default = CongratulateCommand;
//# sourceMappingURL=congratulate.js.map