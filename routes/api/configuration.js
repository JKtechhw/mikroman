const configEditor = require("../../libs/configEditor");
const localization = require("../../libs/localization");
const DB = require("../../libs/db");
const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

const router = express.Router();

router.use("*", (req, res, next) => {
    const mode = req.app.get("mode");
    if(mode == "configuration") {
        next();
        return;
    }

    const local = new localization();

    res.status(403).json({
        success: false,
        status: 403,
        error: "Forbidden",
        message: local.getTranslation().configuration.completed_configuration
    });
    return;
});

router.post("/localization", (req, res) => {
    const ce = new configEditor();
    const config = ce.getConfig();
    const local = new localization();

    if(
        Object.keys(config).includes("country") &&
        Object.keys(config).includes("language")
    ) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.completed_localization
        });
        return;
    }

    if(typeof req.body.language == "undefined" || req.body.language.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.fill_all_fields,
            error_field: "language"
        });
        return;
    }

    if(local.validateLanguage(req.body.language) == false) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.language_not_available,
            error_field: "language"
        });
        return;
    }

    if(typeof req.body.country == "undefined" || req.body.country.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.fill_all_fields,
            error_field: "country"
        });
        return;
    }

    if(local.validateCountry(req.body.country) == false) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.invalid_country,
            error_field: "country"
        });
        return;
    }

    ce.editConfig({
        language: req.body.language,
        country: req.body.country
    });

    console.log(`Localization was successfully configured`);

    res.json({
        success: true,
        message: local.getTranslation().configuration.successful_localization
    });
});

router.post("/database", async (req, res) => {
    const ce = new configEditor();
    const config = ce.getConfig();
    const local = new localization();

    if(
        Object.keys(config).includes("db_name") &&
        Object.keys(config).includes("db_host") &&
        Object.keys(config).includes("db_port") &&
        Object.keys(config).includes("db_user") &&
        Object.keys(config).includes("db_password")
    ) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.completed_database
        });
        return;
    }

    if(typeof req.body.db_host == "undefined" || req.body.db_host.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.fill_all_fields,
            error_field: "db_host"
        });
        return;
    }

    if(typeof req.body.db_port == "undefined" || req.body.db_port.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.fill_all_fields,
            error_field: "db_port"
        });
        return;
    }

    if(isNaN(req.body.db_port)) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.invalid_port,
            error_field: "db_port"
        });
        return;
    }

    if(req.body.db_port <= 0 || req.body.db_port > 65535) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.invalid_port,
            error_field: "db_port"
        });
        return;
    }

    if(typeof req.body.db_user == "undefined" || req.body.db_user.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.fill_all_fields,
            error_field: "db_user"
        });
        return;
    }

    if(typeof req.body.db_database == "undefined" || req.body.db_database.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.fill_all_fields,
            error_field: "db_database"
        });
        return;
    }

    if(typeof req.body.db_password == "undefined" || req.body.db_password.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.fill_all_fields,
            error_field: "db_password"
        });
        return;
    }

    const db = new DB();

    try {
        await db.testDatabase(req.body.db_host, req.body.db_port, req.body.db_user, req.body.db_password);
    }

    catch(e) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: e
        });
        return;
    }

    let tableCount; 

    // try {
    //     tableCount = await db.queryCredentials(req.body.db_user, req.body.db_password, req.body.db_database, req.body.db_host, req.body.db_port, "SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND  schemaname != 'information_schema'");
    // }

    // catch(e) {
    //     res.status(500).json({
    //         success: false,
    //         status: 500,
    //         error: "Internal Server Error",
    //         message: "Nepodařilo se získat tabulky databáze",
    //         hint: local.getTranslation().configuration.check_log
    //     });
    //     return;
    // }

    // if(tableCount.rowCount > 0) {
    //     res.status(500).json({
    //         success: false,
    //         status: 500,
    //         error: "Internal Server Error",
    //         message: "Databáze není prázdná",
    //         accept: "Opravdu chcete použít neprázdnou databázi"
    //     });
    //     return;
    // }

    const sql = fs.readFileSync(path.join(__dirname, "..", "..", "structures", "mikroman.sql")).toString();

    console.log("Creating database structure");

    try {
        await db.queryCredentials(req.body.db_user, req.body.db_password, req.body.db_database, req.body.db_host, req.body.db_port, sql);
    }

    catch(e) {
        console.error(e);

        res.status(500).json({
            success: false,
            status: 500,
            error: "Internal Server Error",
            message: local.getTranslation().configuration.unable_to_create_structure,
            hint: local.getTranslation().configuration.check_log
        });
        return;
    }

    console.log("Database structure was successfully created");

    const dbValues = {
        db_host: req.body.db_host,
        db_port: req.body.db_port,
        db_name: req.body.db_database,
        db_user: req.body.db_user,
        db_password: req.body.db_password,
    }

    try {
        await ce.editConfig(dbValues);
    }

    catch(e) {
        console.error(e);

        res.status(500).json({
            success: false,
            status: 500,
            error: "Internal Server Error",
            message: local.getTranslation().configuration.unable_write_to_file,
            hint: local.getTranslation().configuration.check_log
        });
        return;
    }

    console.log("Database data was successfully written to configuration file");

    res.status(200).json({
        success: true,
        status: 200,
        message: local.getTranslation().configuration.successful_database
    });
    return;
});

router.post("/user", async (req, res) => {
    const ce = new configEditor();
    const config = ce.getConfig();
    const local = new localization();

    const db = new DB();
    let userExists;

    if(config.configured == true) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.completed_user
        });
        return;
    }

    try {
        userExists = await db.query("SELECT * FROM users");
    }

    catch(e) {
        res.status(500).json({
            success: false,
            status: 500,
            error: "Internal Server Error",
            message: local.getTranslation().configuration.unable_to_read_from_db,
            hint: local.getTranslation().configuration.check_log
        });
        return;
    }

    if(userExists.rowCount > 0) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.user_already_exists
        });

        await ce.editConfig({configured: true});
        return;
    }

    if(typeof req.body.username == "undefined" || req.body.username.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.fill_all_fields,
            error_field: "username"
        });
        return;
    }

    if(typeof req.body.password == "undefined" || req.body.password.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.fill_all_fields,
            error_field: "password"
        });
        return;
    }

    if(typeof req.body.password_repeat == "undefined" || req.body.password_repeat.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.fill_all_fields,
            error_field: "password_repeat"
        });
        return;
    }

    if(req.body.password_repeat != req.body.password) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().configuration.passwords_not_match,
            error_field: "password_repeat"
        });
        return;
    }

    bcrypt.hash(req.body.password, 10, async (err, hash) => {
        if(err) {
            console.error(err);
    
            res.status(500).json({
                success: false,
                status: 500,
                error: "Internal Server Error",
                message: local.getTranslation().configuration.unable_to_create_user,
                hint: local.getTranslation().configuration.check_log
            });
            return;
        }

        try {
            await db.query("INSERT INTO users(username, password, on_install) VALUES($1, $2, $3)", [ req.body.username, hash, true ]);
        }
    
        catch(e) {
            console.error(e);
    
            res.status(500).json({
                success: false,
                status: 500,
                error: "Internal Server Error",
                message: local.getTranslation().configuration.unable_to_create_user,
                hint: local.getTranslation().configuration.check_log
            });
            return;
        }

        const configValues = {
            configured: true,
        }
    
        try {
            await ce.editConfig(configValues);
        }
    
        catch(e) {
            console.error(e);
    
            res.status(500).json({
                success: false,
                status: 500,
                error: "Internal Server Error",
                message: local.getTranslation().configuration.unable_write_to_file,
                hint: local.getTranslation().configuration.check_log
            });
            return;
        }

        console.log(`First user "${req.body.username}" was successfully created`);
    
        res.json({
            success: true,
            message: local.getTranslation().configuration.successful_user
        });
        return;
    });
});

router.post("/finish", async (req, res) => {
    req.app.set("mode", "standard");

    console.log(`Exiting configuration mode`);

    res.json({
        success: true,
        continue: "/"
    });
});

module.exports = router;