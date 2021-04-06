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
const discord_js_1 = require("discord.js");
const discord_js_commando_1 = require("discord.js-commando");
const main_1 = require("../../main");
const configuration_1 = __importDefault(require("../../config/configuration"));
const logger_1 = __importDefault(require("../../logger"));
class TicTacToeLeaderBoardCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'tttleaderboard',
            aliases: ['tttlb'],
            group: 'games',
            memberName: 'tttleaderboard',
            description: 'Displays the tictactoe leaderboard.',
        });
    }
    run(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id: guildId } = message.guild;
                const topUsers = yield main_1.app.userService.getByNestedFilter('guildsData', { 'guildsData.guildId': guildId }, 10, { 'guildsData.tictactoeWins': -1 });
                const leaderboard = new discord_js_1.MessageEmbed()
                    .setTitle(`❌⭕ TicTacToe Leaderboard ❌⭕`)
                    .setColor(configuration_1.default.embedMessageColor)
                    .setDescription('Scoreboard of TicTacToe based on victories');
                const usernamesList = [];
                const scoreList = [];
                let position = 1;
                topUsers.forEach((user) => {
                    const { guildsData } = user;
                    let trophy;
                    switch (position) {
                        case 1:
                            trophy = ':first_place:';
                            break;
                        case 2:
                            trophy = ':second_place:';
                            break;
                        case 3:
                            trophy = ':third_place:';
                            break;
                    }
                    usernamesList.push(`${trophy ? trophy : ' '} ${user.name}`);
                    scoreList.push(guildsData.tictactoeWins);
                    position += 1;
                });
                leaderboard.addField('Positioning', usernamesList, true);
                leaderboard.addField('Victories', scoreList, true);
                return message.embed(leaderboard);
            }
            catch (error) {
                logger_1.default.error(error);
                logger_1.default.error(`MongoDB Connection error. Could not retrieve tictactoe leaderboard for '${message.guild.name}' server`, {
                    context: this.constructor.name,
                });
                return message.say(`Sorry ): I couldn't retrieve tictactoe leaderboard. I failed you :sweat:`);
            }
        });
    }
}
exports.default = TicTacToeLeaderBoardCommand;
//# sourceMappingURL=tictactoeleaderboard.js.map