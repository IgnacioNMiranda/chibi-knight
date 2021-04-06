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
const QandA_1 = require("./resources/QandA");
const main_1 = require("../../main");
const configuration_1 = __importDefault(require("../../config/configuration"));
const logger_1 = __importDefault(require("../../logger"));
const links_1 = require("./resources/links");
const index_1 = require("../../utils/index");
class TicTacToeCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'tictactoe',
            aliases: ['ttt'],
            group: 'games',
            memberName: 'tictactoe',
            description: 'Initiates a tictactoe game.',
            args: [
                {
                    key: 'player2',
                    prompt: 'Who do you want to challenge?',
                    type: 'user',
                },
            ],
        });
        this.defaultSymbol = ':purple_square:';
    }
    run(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { author: player1 } = message;
            const { player2 } = args;
            let gameInstanceActive;
            try {
                gameInstanceActive = yield main_1.app.cache.getGameInstanceActive(message);
            }
            catch (error) {
                return message.say('Error ): could not start game. Try again later :sweat:');
            }
            if (gameInstanceActive) {
                return message.say(`There's already a game in course ${player1}!`);
            }
            else if (player1.id === player2.id) {
                return message.say('You cannot challenge yourself ¬¬ ...');
            }
            else if (player2.bot) {
                return message.say("You cannot challenge me :anger: I'm a superior being... I would destroy you n.n :purple_heart:");
            }
            const QandAGames = QandA_1.QandA[0];
            const filter = (response) => {
                return QandAGames.answers.some((answer) => answer === response.content && response.author.id === player2.id);
            };
            yield message.say(`${player2} has been challenged by ${player1} to play #. Do you accept the challenge? (yes/y/no/n)`);
            const collectedMessages = yield message.channel.awaitMessages(filter, {
                max: 1,
                time: 15000,
            });
            if (collectedMessages === null || collectedMessages === void 0 ? void 0 : collectedMessages.first()) {
                const receivedMsg = collectedMessages.first().content;
                if (receivedMsg === 'no' || receivedMsg === 'n') {
                    yield message.say(`Game cancelled ): Come back when you are brave enough, ${player2}.`);
                }
                else if (receivedMsg === 'yes' || receivedMsg === 'y') {
                    try {
                        const { id } = message.guild;
                        const guild = yield main_1.app.guildService.getById(id);
                        guild.gameInstanceActive = true;
                        yield guild.save();
                        const cachedGuild = main_1.app.cache.getGuildById(id);
                        if (cachedGuild) {
                            cachedGuild.gameInstanceActive = true;
                            main_1.app.cache.setGuildById(id, cachedGuild);
                        }
                        else {
                            const { guildId, rolesActivated, gameInstanceActive } = guild;
                            const cached = {
                                guildId,
                                rolesActivated,
                                gameInstanceActive,
                            };
                            main_1.app.cache.setGuildById(guildId, cached);
                        }
                        this.ticTacToeInstance(message, player1, player2, QandAGames);
                    }
                    catch (error) {
                        logger_1.default.error(`MongoDB Connection error. Could not register change game instance active state for ${message.guild.name}`, {
                            context: this.constructor.name,
                        });
                        return message.say('Error ): could not start game. Try again later :purple_heart:');
                    }
                }
            }
            else {
                return message.say(`Time's up! ${player2.username} dont want to play ):`);
            }
        });
    }
    ticTacToeInstance(message, player1, player2, QandAGames) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tictactoeBoard = [
                this.defaultSymbol,
                this.defaultSymbol,
                this.defaultSymbol,
                this.defaultSymbol,
                this.defaultSymbol,
                this.defaultSymbol,
                this.defaultSymbol,
                this.defaultSymbol,
                this.defaultSymbol,
            ];
            const { id: guildId } = message.guild;
            const random = Math.random() < 0.5;
            let activePlayer = random ? player1 : player2;
            let otherPlayer = random ? player2 : player1;
            const embedMessage = this.embedDefaultTicTacToeBoard(player1, player2)
                .addField('Instructions', 'Type the number where you want to make your move.', false)
                .addField('Current turn', `It's your turn ${activePlayer.username}`);
            const sentEmbedMessage = yield message.embed(embedMessage);
            const collector = message.channel.createMessageCollector((receivedMsg) => {
                if (receivedMsg.author.bot) {
                    return false;
                }
                const possibleCancelledGame = receivedMsg.content
                    .split(' ')[0]
                    .split(configuration_1.default.prefix)[1];
                if (possibleCancelledGame === 'cancelgame' ||
                    possibleCancelledGame === 'cg') {
                    collector.stop('Cancel game command executed.');
                }
                const playedPosition = receivedMsg.content;
                const validPlay = QandAGames.ticTacToePositions.some((position) => position === parseInt(playedPosition)) && this.tictactoeBoard[playedPosition] === this.defaultSymbol;
                return receivedMsg.author.id === activePlayer.id && validPlay;
            }, { max: 9 });
            collector.on('collect', (m) => __awaiter(this, void 0, void 0, function* () {
                const playedNumber = m.content;
                try {
                    yield m.delete();
                }
                catch (error) { }
                activePlayer.id == player1.id
                    ? (this.tictactoeBoard[playedNumber] = ':x:')
                    : (this.tictactoeBoard[playedNumber] = ':o:');
                const auxPlayer = activePlayer;
                activePlayer = otherPlayer;
                otherPlayer = auxPlayer;
                const newEmbedMessage = this.embedDefaultTicTacToeBoard(player1, player2);
                const gameState = this.obtainGameState(parseInt(playedNumber));
                if (gameState != -1) {
                    let result;
                    let stopReason;
                    let winner;
                    let loser;
                    switch (gameState) {
                        case 0:
                            result = 'The game was a tie! :confetti_ball: Thanks for play (:';
                            stopReason = `Tictactoe game between ${player1.username} and ${player2.username} ends!`;
                            break;
                        case 1:
                            result = `:tada: CONGRATULATIONS ${player1}! You have won! :tada:`;
                            stopReason = `${player1.username} won on TicTacToe against ${player2.username}!`;
                            winner = player1;
                            loser = player2;
                            break;
                        case 2:
                            result = `:tada: CONGRATULATIONS ${player2}! You have won! :tada:`;
                            stopReason = `${player2.username} won on TicTacToe against ${player1.username}!`;
                            winner = player2;
                            loser = player1;
                            break;
                    }
                    if (winner) {
                        try {
                            logger_1.default.info(`Registering ${winner.username}'s tictactoe victory...`, {
                                context: this.constructor.name,
                            });
                            const score = 10;
                            let finalScore = score;
                            const user = yield main_1.app.userService.getById(winner.id);
                            if (user) {
                                const guildDataIdx = user.guildsData.findIndex((guildData) => guildData.guildId === guildId);
                                user.guildsData[guildDataIdx].participationScore += score;
                                user.guildsData[guildDataIdx].tictactoeWins += 1;
                                finalScore = user.guildsData[guildDataIdx].participationScore;
                                yield user.save();
                            }
                            else {
                                const guildData = {
                                    guildId,
                                    participationScore: score,
                                };
                                const newUser = {
                                    discordId: winner.id,
                                    name: winner.username,
                                    guildsData: [guildData],
                                };
                                yield main_1.app.userService.create(newUser);
                            }
                            const authorGuildMember = yield message.guild.members.fetch(winner.id);
                            index_1.RoleUtil.defineRoles(finalScore, authorGuildMember, message);
                            logger_1.default.info('Victory registered successfully', {
                                context: this.constructor.name,
                            });
                        }
                        catch (error) {
                            logger_1.default.error(`MongoDB Connection error. Could not register ${winner.username}'s tictactoe victory`, {
                                context: this.constructor.name,
                            });
                        }
                    }
                    newEmbedMessage.addField('Result :trophy:', result, false);
                    if (winner && loser) {
                        newEmbedMessage.addField('Consolation prize :second_place:', `Don't worry ${loser}, this is for you:`);
                        newEmbedMessage.setImage(links_1.links.tictactoe.gifs[0]);
                    }
                    yield sentEmbedMessage.edit(newEmbedMessage);
                    collector.stop(stopReason);
                }
                else {
                    newEmbedMessage
                        .addField('Instructions', 'Type the number where you want to make your move.', false)
                        .addField('Current turn', `It's your turn ${activePlayer.username}`, false);
                    yield sentEmbedMessage.edit(newEmbedMessage);
                }
            }));
            collector.on('end', (collected, reason) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const guild = yield main_1.app.guildService.getById(guildId);
                    guild.gameInstanceActive = false;
                    yield guild.save();
                }
                catch (error) {
                    logger_1.default.error(`MongoDB Connection error. Could not change game instance active for ${message.guild.name} server`, {
                        context: this.constructor.name,
                    });
                }
                const cachedGuild = main_1.app.cache.getGuildById(guildId);
                if (cachedGuild) {
                    cachedGuild.gameInstanceActive = false;
                    main_1.app.cache.setGuildById(guildId, cachedGuild);
                }
                logger_1.default.info(reason, {
                    context: this.constructor.name,
                });
            }));
        });
    }
    embedDefaultTicTacToeBoard(player1, player2) {
        return new discord_js_1.MessageEmbed()
            .setTitle(`:x::o: Gato:3 :x::o:`)
            .setColor(configuration_1.default.embedMessageColor)
            .setDescription('Tres en raya | Michi | Triqui | Gato | Cuadritos | Tictactoe | Whatever')
            .addField('Challengers', `${player1.username} V/S ${player2.username}`, false)
            .addField('Board', `
        ${this.tictactoeBoard[0]}${this.tictactoeBoard[1]}${this.tictactoeBoard[2]}
        ${this.tictactoeBoard[3]}${this.tictactoeBoard[4]}${this.tictactoeBoard[5]}
        ${this.tictactoeBoard[6]}${this.tictactoeBoard[7]}${this.tictactoeBoard[8]}
        `, true)
            .addField('Positions reference', `
        :zero::one::two:
        :three::four::five:
        :six::seven::eight:
        `, true);
    }
    obtainGameState(playedNumber) {
        let Xcounter = 0;
        let Ocounter = 0;
        let initialRowPosition = -1;
        if (playedNumber >= 0 && playedNumber <= 2)
            initialRowPosition = 0;
        else if (playedNumber >= 3 && playedNumber <= 5)
            initialRowPosition = 3;
        else
            initialRowPosition = 6;
        for (let i = initialRowPosition; i < initialRowPosition + 3; i++) {
            if (this.tictactoeBoard[i] == this.defaultSymbol) {
                break;
            }
            if (this.tictactoeBoard[i] == ':x:')
                Xcounter++;
            else
                Ocounter++;
            if (i + 1 == initialRowPosition + 3) {
                if (Xcounter == 3)
                    return 1;
                else if (Ocounter == 3)
                    return 2;
            }
        }
        Xcounter = 0;
        Ocounter = 0;
        let initialColPosition = -1;
        if (playedNumber == 0 || playedNumber == 3 || playedNumber == 6)
            initialColPosition = 0;
        else if (playedNumber == 1 || playedNumber == 4 || playedNumber == 7)
            initialColPosition = 1;
        else
            initialColPosition = 2;
        for (let i = initialColPosition; i < 9; i += 3) {
            if (this.tictactoeBoard[i] == this.defaultSymbol) {
                break;
            }
            if (this.tictactoeBoard[i] == ':x:')
                Xcounter++;
            else
                Ocounter++;
            if (i == 6 || i == 7 || i == 8) {
                if (Xcounter == 3)
                    return 1;
                else if (Ocounter == 3)
                    return 2;
            }
        }
        Xcounter = 0;
        Ocounter = 0;
        for (let i = 0; i < 9; i += 4) {
            if (this.tictactoeBoard[i] == this.defaultSymbol) {
                break;
            }
            if (this.tictactoeBoard[i] == ':x:')
                Xcounter++;
            else
                Ocounter++;
            if (i == 8) {
                if (Xcounter == 3)
                    return 1;
                else if (Ocounter == 3)
                    return 2;
            }
        }
        Xcounter = 0;
        Ocounter = 0;
        for (let i = 2; i < 9; i += 2) {
            if (this.tictactoeBoard[i] == this.defaultSymbol) {
                break;
            }
            if (this.tictactoeBoard[i] == ':x:')
                Xcounter++;
            else
                Ocounter++;
            if (i == 6) {
                if (Xcounter == 3)
                    return 1;
                else if (Ocounter == 3)
                    return 2;
            }
        }
        if (this.tictactoeBoard.every((mark) => mark != this.defaultSymbol)) {
            return 0;
        }
        return -1;
    }
}
exports.default = TicTacToeCommand;
//# sourceMappingURL=tictactoe.js.map