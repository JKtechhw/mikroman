const configEditor = require("./libs/configEditor");
const appRouter = require("./routes/router");
const session = require('express-session');
const express = require("express");
const crypto = require("crypto");
const DB = require("./libs/db");

require("dotenv").config();
const app = express();

app.set("view engine", "ejs");

app.set('trust proxy', 1);

//Init on start

async function initApp() {
    console.log("=============================");
    console.log("Initializing app before start");
    console.log("=============================\n");

    const config = new configEditor();
    let secret;

    if(config.exists() == false) {
        console.log("Creating configuration file");

        const valuesToEdit = {}

        //Port from env
        typeof process.env.WEBUI_PORT == "undefined" ? null : valuesToEdit["port"] = process.env.WEBUI_PORT;

        //Seret
        secret = crypto.randomBytes(64).toString('hex');
        valuesToEdit["secret"] = secret;

        //Load postgresql connection 
        typeof process.env.DB_HOST == "undefined" ? null : valuesToEdit["db_host"] = process.env.DB_HOST;

        typeof process.env.DB_NAME == "undefined" ? null : valuesToEdit["db_name"] = process.env.DB_NAME;

        typeof process.env.DB_PORT == "undefined" ? null : valuesToEdit["db_port"] = process.env.DB_PORT;

        typeof process.env.DB_USER == "undefined" ? null : valuesToEdit["db_user"] = process.env.DB_USER;

        typeof process.env.DB_PASSWORD == "undefined" ? null : valuesToEdit["db_password"] = process.env.DB_PASSWORD;

        try {
            await config.createFromDefault(valuesToEdit);
        }

        catch(e) {
            throw e;
        }
        
        console.log("Config file was successfully created\n");
    }

    else {
        secret = config.getConfig().secret;
    }

    app.use(session({
        secret: secret,
        resave: false,
        saveUninitialized: true,
        cookie: {
            sameSite: true,
            httpOnly: true,
            secure: false
        }
    }));

    const configData = config.getConfig();

    if(typeof configData.configured == "undefined" || configData.configured !== true) {
        app.set("mode", "configuration");
        console.log("Starting app in configuration mode\n");
        console.log("Configuration page is available on http://localhost:3000/configuration");
    }
    
    else {
        console.log("Testing database connection from config file");

        const db = new DB();

        try {
            await db.testDatabase();
        }

        catch(e) {
            console.error("Database test failed");
            throw e;
        }

        console.log("Database test was successful\n");

        app.set("mode", "standard");
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