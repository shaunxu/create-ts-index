#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const commander = require("commander");
const createTypeScriptIndex_1 = require("./createTypeScriptIndex");
const option = {
    globOptions: {},
};
// -f -n -s -t -e -x -i -c
commander
    .option("-f --filefirst", "export list create filefirst, no option false, option true")
    .option("-n --addnewline", "deside add newline file ending. no option true, option false")
    .option("-s --usesemicolon", "deside use semicolon line ending. no option true, option false")
    .option("-c --includecwd", "deside include cwd directory in task. no option true, option false")
    .option("-t --usetimestamp", "deside use timestamp(YYYY-MM-DD HH:mm) top line comment. no option false, option true")
    .option("-e --excludes <list>", "pass exclude directory. default exclude directory is `[\"@types\", \"typings\", \"__test__\", \"__tests__\"]`", // tslint:disable-line
    // tslint:disable-line
    values => values.split(/[ |,]/).map(value => value.trim()))
    .option("-i --fileexcludes <list>", "pass exclude pattern of filename. default exclude directory is `[]`", // tslint:disable-line
    // tslint:disable-line
    values => values.split(/[ |,]/).map(value => value.trim()))
    .option("-x --targetexts <list>", "pass include extname. default extname is `[\"ts\", \"tsx\"]`. extname pass without dot charactor.", // tslint:disable-line
    // tslint:disable-line
    values => values.split(/[ |,]/).map(value => value.trim()))
    .parse(process.argv);
const [cwd] = commander.args;
if (!cwd) {
    console.log(chalk.default.magenta("Enter working directory, "));
    console.log(chalk.default.red("cti [working directory]"));
    process.exit(1);
}
console.log(chalk.default.green("working directory: ", cwd));
option.fileFirst = !!commander["filefirst"];
option.addNewline = !commander["addnewline"];
option.useSemicolon = !commander["usesemicolon"];
option.useTimestamp = commander["usetimestamp"];
option.includeCWD = commander["includecwd"];
option.excludes = commander["excludes"];
option.fileExcludePatterns = commander["fileexcludes"];
option.targetExts = commander["targetexts"];
option.globOptions.cwd = cwd;
(() => __awaiter(this, void 0, void 0, function* () {
    yield createTypeScriptIndex_1.createTypeScriptIndex(option);
}))();
//# sourceMappingURL=cti.js.map