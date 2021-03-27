"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const { combine, printf } = winston_1.format;
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 5,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
    },
};
const formatter = printf(({ level, message, context }) => {
    return `[${level}] (${context}): ${message}`;
});
winston_1.addColors(customLevels.colors);
const logger = winston_1.createLogger({
    levels: customLevels.levels,
    format: combine(winston_1.format.colorize(), formatter),
    transports: [
        new winston_1.transports.Console(),
    ],
});
exports.default = logger;
//# sourceMappingURL=logger.js.map