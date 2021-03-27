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
const groupsDescriptions_1 = require("./resources/groupsDescriptions");
const configuration_1 = __importDefault(require("../../config/configuration"));
class HelpCommand extends discord_js_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'help',
            aliases: ['h'],
            group: 'misc',
            memberName: 'help',
            description: 'Gives information about every existing command.',
            args: [],
        });
    }
    run(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const embedMessage = new discord_js_1.MessageEmbed()
                .attachFiles(['./public/img/chibiKnightLogo.png'])
                .setAuthor('Chibi Knight', 'attachment://chibiKnightLogo.png')
                .setThumbnail('attachment://chibiKnightLogo.png')
                .setColor(configuration_1.default.embedMessageColor);
            const commandName = message.content.split(' ')[1];
            if (commandName) {
                const command = this.client.registry.findCommands(commandName, true)[0];
                if (command) {
                    let cmdArgs = 'none';
                    if (command.argsCollector) {
                        const args = command.argsCollector.args;
                        if (args[0].type.id == 'user')
                            cmdArgs = '@User';
                        else if (args[0].type.id == 'string')
                            cmdArgs = `{${args[0].key}}`;
                    }
                    embedMessage.addField(`${command.name.toLocaleUpperCase()}: `, `
                **Description**: ${command.description}
                **Aliases**: ${command.aliases}
                **Parameters**: ${cmdArgs}
                **Syntax**: ${configuration_1.default.prefix}${command.aliases[0]} ${cmdArgs}
                `);
                    embedMessage.setFooter(`Type ${configuration_1.default.prefix}help to see a list with every available command.`);
                    yield message.say(embedMessage);
                }
                else {
                    yield message.say(`Unknown command!! There are no commands with that name ):`);
                }
            }
            else {
                embedMessage.setDescription(`:crossed_swords: These are the available commands for Chibi Knight n.n`);
                const groups = this.client.registry.groups;
                groups
                    .filter((group) => group.commands.some((cmd) => !cmd.hidden && cmd.isUsable(message)))
                    .forEach((group) => {
                    const commandsList = group.commands
                        .filter((cmd) => !cmd.hidden && cmd.isUsable(message))
                        .map((cmd) => {
                        let cmdArgs = '';
                        const argsCollector = cmd.argsCollector;
                        if ((argsCollector === null || argsCollector === void 0 ? void 0 : argsCollector.args.length) > 0) {
                            const args = argsCollector.args;
                            if (args[0].type.id === 'user') {
                                cmdArgs = '@User';
                            }
                            else if (args[0].type.id === 'string') {
                                cmdArgs = `{${args[0].key}}`;
                            }
                        }
                        return `**${configuration_1.default.prefix}${cmd.name} ${cmdArgs}:** ${cmd.description}`;
                    });
                    const groupTitle = groupsDescriptions_1.groupsDescriptions[group.id];
                    embedMessage.addField(groupTitle, commandsList);
                });
                embedMessage.setFooter(`Type ${configuration_1.default.prefix}help {command} to see information about an specific command.`);
                yield message.say(embedMessage);
            }
            return;
        });
    }
}
exports.default = HelpCommand;
//# sourceMappingURL=help.js.map