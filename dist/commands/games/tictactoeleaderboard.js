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
const typegoose_1 = require("@typegoose/typegoose");
const discord_js_1 = require("discord.js");
const discord_js_commando_1 = require("discord.js-commando");
const configuration_1 = __importDefault(require("../../config/configuration"));
const user_model_1 = __importDefault(require("../../database/models/user.model"));
const logger_1 = __importDefault(require("../../logger"));
const mongo_1 = require("../../database/mongo");
class TicTacToeLeaderBoardCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'tttleaderboard',
            aliases: ['tttlb'],
            group: 'games',
            memberName: 'tttleaderboard',
            description: 'Displays the tictactoe leaderboard.',
        });
        this.userRepository = typegoose_1.getModelForClass(user_model_1.default);
    }
    run(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongoose = yield mongo_1.openMongoConnection();
                const topUsers = yield this.userRepository
                    .find({
                    tictactoeWins: { $exists: true },
                })
                    .limit(10)
                    .sort({ tictactoeWins: -1 })
                    .exec();
                yield mongoose.connection.close();
                const leaderboard = new discord_js_1.MessageEmbed()
                    .setTitle(`❌⭕ TicTacToe Leaderboard ❌⭕`)
                    .setColor(configuration_1.default.embedMessageColor)
                    .setDescription('Scoreboard of TicTacToe based on victories');
                const usernamesList = [];
                const scoreList = [];
                let position = 1;
                topUsers.forEach((user) => {
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
                    scoreList.push(user.tictactoeWins);
                    position += 1;
                });
                leaderboard.addField('Positioning', usernamesList, true);
                leaderboard.addField('Victories', scoreList, true);
                return message.embed(leaderboard);
            }
            catch (error) {
                logger_1.default.error(`MongoDB Connection error. Could not retrieve tictactoe leaderboard`, {
                    context: this.constructor.name,
                });
                return message.say('Sorry ): Could not retrieve tictactoe leaderboard. I failed you :sweat:');
            }
        });
    }
}
exports.default = TicTacToeLeaderBoardCommand;
//# sourceMappingURL=tictactoeleaderboard.js.map