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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var logger_1 = require("../lib/logger");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var e_1, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 5]);
                    logger_1.logger.info('Database seeding started (Quiz Only).');
                    // Seed a sample quiz
                    logger_1.logger.info('Seeding sample quiz...');
                    return [4 /*yield*/, prisma.quiz.create({
                            data: {
                                topic: 'JavaScript',
                                difficulty: 'Beginner',
                                questions: {
                                    create: [
                                        {
                                            text: 'What keyword is used to declare a variable in JavaScript?',
                                            options: JSON.stringify(['var', 'let', 'const', 'all of the above']),
                                            correctAnswer: 'all of the above',
                                            explanation: '`var` is the oldest keyword. `let` and `const` were introduced in ES6. `let` allows reassignment, while `const` does not.',
                                        },
                                        {
                                            text: 'Which of the following is NOT a primitive data type in JavaScript?',
                                            options: JSON.stringify(['String', 'Number', 'Object', 'Boolean']),
                                            correctAnswer: 'Object',
                                            explanation: 'In JavaScript, primitive data types are String, Number, Boolean, Null, Undefined, Symbol, and BigInt. Object is a complex data type.',
                                        },
                                        {
                                            text: 'What does the `===` operator do?',
                                            options: JSON.stringify(['Compares for equality without type conversion', 'Compares for equality with type conversion', 'Assigns a value', 'None of the above']),
                                            correctAnswer: 'Compares for equality without type conversion',
                                            explanation: 'The strict equality operator `===` checks if two operands are equal, returning a Boolean result. Unlike the abstract equality operator (`==`), it does not perform type conversion.',
                                        },
                                        {
                                            text: 'How do you write a single-line comment in JavaScript?',
                                            options: JSON.stringify(['// This is a comment', '<!-- This is a comment -->', '/* This is a comment */', '# This is a comment']),
                                            correctAnswer: '// This is a comment',
                                            explanation: 'Single-line comments in JavaScript start with `//`. Multi-line comments start with `/*` and end with `*/`.',
                                        },
                                        {
                                            text: 'Which function is used to print content to the console?',
                                            options: JSON.stringify(['console.log()', 'print()', 'log.console()', 'debug.print()']),
                                            correctAnswer: 'console.log()',
                                            explanation: 'The `console.log()` method is used to output messages to the web console.',
                                        },
                                    ],
                                },
                            },
                        })];
                case 1:
                    _a.sent();
                    logger_1.logger.info('Sample quiz seeded successfully.');
                    return [3 /*break*/, 5];
                case 2:
                    e_1 = _a.sent();
                    error = e_1 instanceof Error ? e_1 : new Error(String(e_1));
                    logger_1.logger.error('❌ Simplified Seed failed:', error);
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, prisma.$disconnect()];
                case 4:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () {
    logger_1.logger.info('✅ Simplified Seed completed successfully!');
    process.exit(0);
})
    .catch(function (e) {
    var error = e instanceof Error ? e : new Error(String(e));
    logger_1.logger.error('❌ Simplified Seed failed:', error);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
