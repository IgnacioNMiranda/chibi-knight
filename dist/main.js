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
exports.app = void 0;
const path_1 = __importDefault(require("path"));
const configuration_1 = __importDefault(require("./config/configuration"));
const discord_js_commando_1 = require("discord.js-commando");
const logger_1 = __importDefault(require("./logger"));
class App {
    constructor() {
        this.initClient();
    }
    initClient() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client = new discord_js_commando_1.CommandoClient({
                commandPrefix: configuration_1.default.prefix,
                owner: configuration_1.default.clientId,
                invite: '',
            });
            this.client.registry
                .registerDefaultTypes()
                .registerGroups([
                ['games', 'Games commands'],
                ['misc', 'Miscellaneous commands'],
                ['music', 'Music commands'],
            ])
                .registerCommandsIn({
                filter: /^([^.].*)\.js$/,
                dirname: path_1.default.join(__dirname, './commands'),
            });
            this.client.on('error', console.error).on('warn', console.warn);
            this.client.once('ready', () => {
                this.client.user.setActivity('>help');
                this.gameInstanceActive = false;
                logger_1.default.info(`${this.client.user.username} is online n.n`, {
                    context: this.constructor.name,
                });
            });
            try {
                logger_1.default.info('Logging in...', {
                    context: this.constructor.name,
                });
                yield this.client.login(configuration_1.default.token);
            }
            catch (error) {
                const { code, method, path } = error;
                console.error(`Error ${code} trying to ${method} to ${path} path`);
            }
        });
    }
}
exports.app = new App();
//# sourceMappingURL=main.js.map