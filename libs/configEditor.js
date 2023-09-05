const path = require("path");
const fs = require("fs");

class configEditor {
    constructor() {}

    exists(pathToFile = path.join(__dirname, "..", "config", "config.json")) {
        if(fs.existsSync(pathToFile)) {
            return true;
        }

        return false;
    }

    getConfig(pathToFile = path.join(__dirname, "..", "config", "config.json")) {
        if(this.exists(pathToFile) == false) {
            throw new Error("Config file does not exists");
        }
        
        const config = require(pathToFile);
        return config;
    }

    editConfig(valuesToEdit, pathToConfig = path.join(__dirname, "..", "config", "config.json")) {
        return new Promise((resolve) => {
            if(typeof valuesToEdit != "object") {
                throw new Error("Provided values is in invalid format, use JS object");
            }
    
            if(this.exists(pathToConfig) == false) {
                throw new Error("Edited config file does not exists");
            }
    
            const config = this.getConfig(pathToConfig);
    
            for(const edited of Object.keys(valuesToEdit)) {
                config[edited] = valuesToEdit[edited];
            }

            const newData = JSON.stringify(config, null, 2);

            fs.writeFile(pathToConfig, newData, (err) => {
                if(err) {
                    throw err;
                }

                resolve();
            });
        });
    }

    removeFromConfig(valuesToDelete, pathToConfig = path.join(__dirname, "..", "config", "config.json")) {
        return new Promise((resolve) => {
            if(Array.isArray(valuesToDelete)) {
                throw new Error("Provided values is in invalid format, use string array");
            }
    
            if(this.exists(pathToConfig) == false) {
                throw new Error("Edited config file does not exists");
            }
    
            const config = this.getConfig(pathToConfig);
    
            for(const edited of valuesToDelete) {
                delete config[edited]
            }

            const newData = JSON.stringify(config, null, 2);

            fs.writeFile(pathToConfig, newData, (err) => {
                if(err) {
                    throw err;
                }

                resolve();
            });
        });
    }

    createFromDefault(valuesToReplace = null, pathToDefault = path.join(__dirname, "..", "config", "default.json"), pathToNew = path.join(__dirname, "..", "config", "config.json")) {
        return new Promise((resolve) => {
            if(fs.existsSync(pathToDefault) == false) {
                throw new Error("Default config file does not exists");
            }
    
            if(fs.existsSync(pathToNew)) {
                fs.unlinkSync(pathToNew);
            }

            if(valuesToReplace == null) {
                fs.copyFile(pathToDefault, pathToNew, (err) => {
                    if(err) {
                        throw err;
                    }

                    resolve();
                });
            }

            else {
                if(typeof valuesToReplace != "object") {
                    throw new Error("Values to replace has to be object");
                }

                fs.readFile(pathToDefault, (err, defaultData) => {
                    if(err) {
                        throw err;
                    }

                    let defaultJson;
                    try {
                        defaultJson = JSON.parse(defaultData);
                    }

                    catch(e) {
                        throw new Error("Source file is not valid JSON format");
                    }

                    for (const value of Object.keys(valuesToReplace)) {
                        defaultJson[value] = valuesToReplace[value];
                    }

                    const newData = JSON.stringify(defaultJson, null, 2);

                    fs.writeFile(pathToNew, newData, (err) => {
                        if(err) {
                            throw err;
                        }

                        resolve();
                    })
                });
            }
        });
    }
}

module.exports = configEditor;