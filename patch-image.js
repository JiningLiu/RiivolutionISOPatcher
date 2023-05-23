(async () => {
    const fs = require('fs');
    const path = require('path');
    const { exec, execSync } = require('child_process');
    const waitSync = require('wait-sync');
    const { XMLParser } = require("fast-xml-parser");
    const cliSelect = require('cli-select');
    const { Chalk } = await import('chalk');

    const romRoot = path.join(__dirname, 'GAME_IMAGE_FILE');
    const sdRoot = path.join(__dirname, 'SD_FILES');
    const riivolutionPath = path.join(sdRoot, 'riivolution');

    try {
        if (!fs.existsSync(riivolutionPath)) {
            throw '"SD_FILES/riivolution" does not exist. Ending script.';
        }
        const files = fs.readdirSync(riivolutionPath).filter(file => path.extname(file) === '.xml');
        if (files.length > 0) {
            const chalk = new Chalk({ level: 1 });
            console.log(chalk.yellow('Select a Riivolution XML file to patch the image with:'));
            cliSelect({
                values: fs.readdirSync(riivolutionPath).filter(file => path.extname(file) === '.xml'), valueRenderer: (value, selected) => {

                    if (selected) {
                        return chalk.underline(chalk.green(value));
                    }

                    return chalk.red(value);
                }
            }).then((result) => {
                const file = result.value;
                console.log(chalk.green(file));
                const xml = fs.readFileSync(path.join(riivolutionPath, file), 'utf8');
                const parser = new XMLParser({
                    ignoreAttributes: false,
                    attributeNamePrefix: "",
                });
                const xmlObj = parser.parse(xml);
                let patches = xmlObj.wiidisc.patch;
                const filter = patches.map(patch => patch.id);
                const filterAsk = (index, completion) => {
                    if (index >= filter.length) {
                        completion();
                        return;
                    }
                    console.log(chalk.yellow('Apply patch "' + filter[index] + '"?'));
                    cliSelect({
                        values: ['Yes', 'No'], valueRenderer: (value, selected) => {

                            if (selected) {
                                return chalk.underline(value === 'Yes' ? chalk.green(value) : chalk.red(value));
                            }

                            return value === 'Yes' ? chalk.green(value) : chalk.red(value);
                        }
                    }).then((result) => {
                        console.log(result.value == 'Yes' ? chalk.green('Yes') : chalk.red('No'));
                        if (result.value == 'No') {
                            patches = patches.filter(patch => patch.id != filter[index]);
                        }
                        filterAsk(index + 1, completion);
                    })
                };
                filterAsk(0, () => {
                    const folders = patches.map(patch => patch.folder || (patch.folder && patch.folder.map ? patch.folder.map(folder => folder) : null)).flat().filter(folder => folder !== null && folder.disc && folder.external);
                    const files = patches.map(patch => patch.file || (patch.file && patch.file.map ? patch.file.map(file => file) : null)).flat().filter(file => file !== null && file.disc && file.external);

                    console.log(chalk.yellow('Continue with patch?'));
                    cliSelect({
                        values: ['No', 'Yes'], valueRenderer: (value, selected) => {

                            if (selected) {
                                return chalk.underline(value === 'Yes' ? chalk.green(value) : chalk.red(value));
                            }

                            return value === 'Yes' ? chalk.green(value) : chalk.red(value);
                        }
                    }).then((result) => {
                        if (result.value === 'Yes') {
                            console.log(chalk.green('Yes'));
                            exec('cd ' + romRoot + ' && pwd', (error, _, stderr) => {
                                if (error) {
                                    throw error;
                                }
                                if (stderr) {
                                    throw stderr;
                                }
                                const wbfsFiles = fs.readdirSync(romRoot).filter(file => path.extname(file) === '.wbfs');
                                if (wbfsFiles.length > 0) {
                                    if (wbfsFiles.length > 1) {
                                        throw 'Multiple WBFS files found in "GAME_IMAGE_FILE". Please only include one. Ending script.';
                                    }

                                    console.log(chalk.yellow('Running "wit EXTRACT"... (This may take a while)'));
                                    exec('rm -rf temp/ && wit EXTRACT ' + path.resolve(romRoot, wbfsFiles[0]) + ' temp/', (error, stdout, stderr) => {
                                        if (error) {
                                            throw error;
                                        }
                                        if (stderr) {
                                            throw stderr;
                                        }

                                        console.log(chalk.dim(stdout));
                                        console.log(chalk.yellow('Patching Files...'));

                                        folders.forEach(folder => {
                                            if (fs.existsSync(path.join(sdRoot, folder.external))) {
                                                const { stdout } = execSync('cp -rf "' + path.join(sdRoot, folder.external) + '" "' + path.join(__dirname, '/temp/files', folder.disc) + '"');
                                                console.log(chalk.dim('Copied "' + path.join(sdRoot, folder.external) + '" to "' + path.join(__dirname, '/temp/files', folder.disc) + '" - ' + stdout));
                                            } else {
                                                console.log(chalk.red('"' + path.join(sdRoot, folder.external) + '" does not exist. Skipping.'));
                                            }
                                            waitSync(0.01);
                                        });

                                        files.forEach(file => {
                                            if (fs.existsSync(path.join(sdRoot, file.external))) {

                                                let adjustedPath = null;

                                                const fromDir = function (startPath, filter) {

                                                    if (!fs.existsSync(startPath)) return;

                                                    const files = fs.readdirSync(startPath);
                                                    for (let i = 0; i < files.length; i++) {
                                                        if (adjustedPath) break;
                                                        const filename = path.join(startPath, files[i]);
                                                        const stat = fs.lstatSync(filename);
                                                        if (stat.isDirectory()) {
                                                            fromDir(filename, filter);
                                                        } else if (filename.includes(filter)) {
                                                            adjustedPath = path.resolve(filename);
                                                            break;
                                                        }
                                                    }
                                                };
                                                fromDir(path.join(__dirname, '/temp'), file.disc);
                                                const { stdout } = exec('cp -rf "' + path.join(sdRoot, file.external) + '" "' + (adjustedPath || path.join(__dirname, '/temp/files', file.disc)) + '"');
                                                console.log(chalk.dim('Copied "' + path.join(sdRoot, file.external) + '" to "' + (adjustedPath || path.join(__dirname, '/temp/files', file.disc)) + '" - Destination was ' + (adjustedPath ? chalk.green('found') : chalk.blue('created')) + ' - ' + stdout));
                                            } else {
                                                console.log(chalk.red('"' + path.join(sdRoot, file.external) + '" does not exist. Skipping.'));
                                            }
                                            waitSync(0.01);
                                        });
                                        console.log(chalk.yellow('Running "wit COPY"... (This may take a while)'));
                                        exec('rm -rf PATCHED_FILE && mkdir PATCHED_FILE && wit COPY temp/ PATCHED_FILE/game.wbfs', (error, stdout, stderr) => {
                                            if (error) {
                                                throw error;
                                            }
                                            if (stderr) {
                                                throw stderr;
                                            }
                                            console.log(chalk.dim(stdout));
                                            console.log(chalk.yellow('Running "wit VERIFY"... (This may take a while)'));
                                            exec('wit VERIFY PATCHED_FILE/game.wbfs', (error, stdout, stderr) => {
                                                if (error) {
                                                    throw error;
                                                }
                                                if (stderr) {
                                                    throw stderr;
                                                }
                                                console.log(chalk.dim(stdout));
                                                console.log(chalk.yellow('Remove temp folder?'));
                                                cliSelect({
                                                    values: ['Yes', 'No'], valueRenderer: (value, selected) => {

                                                        if (selected) {
                                                            return chalk.underline(value === 'Yes' ? chalk.green(value) : chalk.red(value));
                                                        }

                                                        return value === 'Yes' ? chalk.green(value) : chalk.red(value);
                                                    }
                                                }).then((result) => {
                                                    console.log(result.value == 'Yes' ? chalk.green('Yes') : chalk.red('No'));
                                                    if (result.value == 'Yes') {
                                                        console.log(chalk.yellow('Removing temp files...'));
                                                        exec('rm -rf temp/', (error, stdout, stderr) => {
                                                            if (error) {
                                                                throw error;
                                                            }
                                                            if (stderr) {
                                                                throw stderr;
                                                            }
                                                            console.log(chalk.dim(stdout));
                                                        });
                                                    }
                                                    console.log(chalk.green('Done! Patched file is located at "PATCHED_FILE/game.wbfs". Ending Script.'));
                                                });
                                            });
                                        });
                                    });
                                } else {
                                    throw 'No WBFS files found in "GAME_IMAGE_FILE". Ending script.';
                                }
                            });
                        } else {
                            console.log(chalk.red('No'));
                            throw 'Ending script.';
                        }
                    }).catch((err) => {
                        console.error(err);
                    });
                });
            }).catch((err) => {
                console.log(err);
            });
        } else {
            throw 'No XML files found in "SD_FILES/riivolution" folder. Ending script.';
        }
    } catch (err) {
        console.error(err);
    }
})();