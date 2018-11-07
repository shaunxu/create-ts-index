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
const moment = require("moment");
const util = require("util");
const glob = require("glob");
const fs = require("fs");
const chalk = require("chalk");
const path = require("path");
function addDot(ext) {
    if (ext.startsWith(".")) {
        return ext;
    }
    return `.${ext}`;
}
function addNewline(option, data) {
    if (option.addNewline) {
        return data + "\n";
    }
    return data;
}
function indexWriter(directory, directories, option) {
    return __awaiter(this, void 0, void 0, function* () {
        const readDirFunc = util.promisify(fs.readdir);
        const writeFileFunc = util.promisify(fs.writeFile);
        const statFunc = util.promisify(fs.stat);
        const indexFiles = option.targetExts.map(targetExt => `index.${targetExt}`);
        try {
            console.log(chalk.default.yellow("Current working: ", directory));
            const resolvePath = path.resolve(option.globOptions.cwd);
            const elements = yield readDirFunc(path.join(resolvePath, directory));
            const targets = elements
                .filter(element => indexFiles.indexOf(element) < 0)
                .filter((element) => {
                const isTarget = option.targetExts.reduce((result, ext) => {
                    return result || addDot(ext) === path.extname(element);
                }, false);
                const isHaveTarget = directories.indexOf(path.join(directory, element)) >= 0;
                return isTarget || isHaveTarget;
            });
            const stats = yield Promise.all(targets.map(target => statFunc(path.join(resolvePath, directory, target))));
            const categorized = targets.reduce((result, target, index) => {
                if (stats[index].isDirectory()) {
                    result.dir.push(target);
                }
                else {
                    result.allFiles.push(target);
                }
                return result;
            }, { dir: [], allFiles: [] });
            categorized.dir.sort();
            const files = categorized.allFiles.filter((element) => {
                return !option.fileExcludePatterns.reduce((result, excludePattern) => {
                    return result || element.indexOf(excludePattern) >= 0;
                }, false);
            });
            files.sort();
            const sorted = (() => {
                if (option.fileFirst) {
                    return categorized.allFiles.concat(categorized.dir);
                }
                return categorized.dir.concat(files);
            })();
            const exportString = sorted.map((target) => {
                let targetFileWithoutExt = target;
                option.targetExts.forEach((ext) => {
                    return targetFileWithoutExt = targetFileWithoutExt.replace(addDot(ext), "");
                });
                if (option.useSemicolon) {
                    return `export * from "./${targetFileWithoutExt}";`;
                }
                return `export * from "./${targetFileWithoutExt}"`;
            });
            const comment = (() => {
                if (option.useTimestamp) {
                    return `// created from "create-ts-index" ${moment(new Date()).format("YYYY-MM-DD HH:mm")}\n\n`; // tslint:disable-line
                }
                // return `// created from "create-ts-index"\n\n`; // tslint:disable-line
            })();
            const fileContent = comment + addNewline(option, exportString.join("\n"));
            yield writeFileFunc(path.join(resolvePath, directory, "index.ts"), fileContent, "utf8");
        }
        catch (err) {
            console.log(chalk.default.red("indexWriter: ", err.message));
        }
    });
}
exports.indexWriter = indexWriter;
function createTypeScriptIndex(_option) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const option = Object.assign({}, _option);
            if (!option.globOptions) {
                option.globOptions = {};
            }
            option.fileFirst = option.fileFirst || false;
            option.addNewline = option.addNewline || true;
            option.useSemicolon = option.useSemicolon || true;
            option.useTimestamp = option.useTimestamp || false;
            option.includeCWD = option.includeCWD || true;
            option.fileExcludePatterns = option.fileExcludePatterns || [];
            option.globOptions.cwd = option.globOptions.cwd || process.cwd();
            option.globOptions.nonull = option.globOptions.nonull || true;
            option.globOptions.dot = option.globOptions.dot || true;
            option.excludes = option.excludes || [
                "@types", "typings", "__test__", "__tests__", "node_modules",
            ];
            option.targetExts = option.targetExts || ["ts", "tsx"];
            option.targetExts = option.targetExts.sort((l, r) => r.length - l.length);
            const targetFileGlob = option.targetExts.map(ext => `*.${ext}`).join("|");
            const globFunc = util.promisify(glob);
            const allTsFiles = yield globFunc(`**/+(${targetFileGlob})`, option.globOptions);
            const tsFiles = allTsFiles
                .filter((tsFilePath) => {
                return !option.excludes.reduce((result, exclude) => {
                    return result || tsFilePath.indexOf(exclude) >= 0;
                }, false);
            })
                .filter(tsFilePath => !tsFilePath.endsWith(".d.ts"))
                .filter((tsFilePath) => {
                return !option.fileExcludePatterns.reduce((result, excludePattern) => {
                    return result || tsFilePath.indexOf(excludePattern) >= 0;
                }, false);
            })
                .filter((tsFilePath) => {
                return !option.targetExts
                    .map(ext => `index.${ext}`)
                    .reduce((result, indexFile) => {
                    return result || tsFilePath.indexOf(indexFile) >= 0;
                }, false);
            });
            const dupLibDirs = tsFiles
                .filter(tsFile => tsFile.split(path.sep).length > 1)
                .map((tsFile) => {
                const splitted = tsFile.split(path.sep);
                const allPath = Array(splitted.length - 1)
                    .fill(0)
                    .map((_, index) => index + 1)
                    .map((index) => {
                    const a = splitted.slice(0, index).join(path.sep);
                    return a;
                });
                return allPath;
            })
                .reduce((aggregated, libPath) => {
                return aggregated.concat(libPath);
            }, []);
            const dirSet = new Set();
            dupLibDirs.forEach(dir => dirSet.add(dir));
            tsFiles.map(tsFile => path.dirname(tsFile)).forEach(dir => dirSet.add(dir));
            const tsDirs = Array.from(dirSet);
            if (option.includeCWD) {
                tsDirs.push(".");
            }
            tsDirs.sort((left, right) => {
                const llen = left.split(path.sep).length;
                const rlen = right.split(path.sep).length;
                if (llen > rlen) {
                    return -1;
                }
                if (llen < rlen) {
                    return 1;
                }
                return 0;
            });
            yield Promise.all(tsDirs.map(tsDir => indexWriter(tsDir, tsDirs, option)));
        }
        catch (err) {
            console.log(chalk.default.red(err.message));
        }
    });
}
exports.createTypeScriptIndex = createTypeScriptIndex;
//# sourceMappingURL=createTypeScriptIndex.js.map