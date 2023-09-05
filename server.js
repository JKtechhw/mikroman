const configEditor = require("./libs/configEditor");
const appRouter = require("./routes/router");
const session = require('express-session');
const express = require("express");
const DB = require("./libs/db");
const path = require("path");

require("dotenv").config();
const app = express();

app.set("view engine", "ejs");

app.set('trust proxy', 1);

app.use(session({
    secret: crypto.randomUUID(),
    resave: false,
    saveUninitialized: true,
    cookie: {
        sameSite: true,
        httpOnly: true,
        secure: false
    }
}));

//Init on start
const config = new configEditor();

async function initApp() {
    console.log("=============================");
    console.log("Initializing app before start");
    console.log("=============================\n");

    if(config.exists() == false) {
        console.log("Creating configuration file");

        const valuesToEdit = {}
        const defaultConfig = config.getConfig(path.join(__dirname, "config", "default.json"));

        valuesToEdit["port"] = typeof process.env.WEBUI_PORT == "undefined" ? defaultConfig.port : process.env.WEBUI_PORT;

        try {
            await config.createFromDefault(valuesToEdit);
        }

        catch(e) {
            throw e;
        }
        
        console.log("Config file was successfully created\n");
    }

    const configData = config.getConfig();

    if(typeof configData.configured == "undefined" || configData.configured !== true) {
        console.log("Starting app in configuration mode\n");
        console.log("Configuration page is available on http://localhost:3000/installation\n");
    }
    
    else {
        console.log("Testing database connection from config file");

        const db = new DB();

        try {
            await db.testDatabase();
        }

        catch(e) {
            throw e;
        }

        console.log("Database test was successful\n");

        console.log("Starting app in standard mode");
    }


    console.log("\n=============================");
    console.log("Initialization was successful");
    console.log("=============================\n");

    app.use("/", appRouter);

    app.listen(configData.port, () => {
        console.log(`Server is running on port ${configData.port}...`)
    });
}

initApp();