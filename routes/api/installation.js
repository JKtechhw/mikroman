const configEditor = require("../../libs/configEditor");
const DB = require("../../libs/db");
const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const net = require('net');
const fs = require("fs");

const router = express.Router();

router.post("/database", async (req, res) => {
    const ce = new configEditor();
    const config = ce.getConfig();

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
            message: "Databáze již byla nastavena"
        });
        return;
    }

    if(typeof req.body.db_host == "undefined" || req.body.db_host.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Vyplňte všechny údaje",
            error_field: "db_host"
        });
        return;
    }

    if(!net.isIP(req.body.db_host)) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Neplatný host",
            error_field: "db_host"
        });
        return;
    }

    if(typeof req.body.db_port == "undefined" || req.body.db_port.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Vyplňte všechny údaje",
            error_field: "db_port"
        });
        return;
    }

    if(isNaN(req.body.db_port)) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Port musí být číslo",
            error_field: "db_port"
        });
        return;
    }

    if(req.body.db_port <= 0 || req.body.db_port > 65535) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Neplatná hodnota portu",
            error_field: "db_port"
        });
        return;
    }

    if(req.body.db_port <= 0) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Neplatná hodnota portu",
            error_field: "db_port"
        });
        return;
    }

    if(typeof req.body.db_user == "undefined" || req.body.db_user.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Vyplňte všechny údaje",
            error_field: "db_user"
        });
        return;
    }

    if(typeof req.body.db_database == "undefined" || req.body.db_database.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Vyplňte všechny údaje",
            error_field: "db_database"
        });
        return;
    }

    if(typeof req.body.db_password == "undefined" || req.body.db_password.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Vyplňte všechny údaje",
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

    try {
        tableCount = await db.queryCredentials(req.body.db_user, req.body.db_password, req.body.db_database, req.body.db_host, req.body.db_port, "SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND  schemaname != 'information_schema'");
    }

    catch(e) {
        res.status(500).json({
            success: false,
            status: 500,
            error: "Internal Server Error",
            message: "Nepodařilo se získat tabulky databáze",
            hint: "Zkontrolujte log aplikace"
        });
        return;
    }

    if(tableCount.rowCount > 0) {
        res.status(500).json({
            success: false,
            status: 500,
            error: "Internal Server Error",
            message: "Databáze není prázdná",
            hint: "Odstraňte všechny tabulky"
        });
        return;
    }

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
            message: "Nepodařilo se vytvořit strukturu databáze",
            hint: "Zkontrolujte log aplikace"
        });
        return;
    }

    console.log("Satabase structure was successfully created");

    const dbValues = {
        db_name: req.body.db_database,
        db_host: req.body.db_host,
        db_port: req.body.db_port,
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
            message: "Nepodařilo se zapsat údaje do konfiguračního souboru",
            hint: "Zkontrolujte log aplikace"
        });
        return;
    }

    console.log("Database data was successfully written to configuration file");

    res.status(200).json({
        success: true,
        status: 200,
        message: "Připojení k databázi bylo úspěšné"
    });
    return;
});

router.post("/user", async (req, res) => {
    const ce = new configEditor();
    const config = ce.getConfig();

    const db = new DB();
    let userExists;

    try {
        userExists = await db.query("SELECT * FROM users");
    }

    catch(e) {
        res.status(500).json({
            success: false,
            status: 500,
            error: "Internal Server Error",
            message: "Nepodařilo se získat data z databáze",
            hint: "Zkontrolujte log aplikace"
        });
        return;
    }

    if(userExists.rowCount > 0) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Uživatel byl již vytvořen"
        });

        await ce.editConfig({configured: true});
        return;
    }

    if(config.configured == true) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Uživatel byl již vytvořen"
        });
        return;
    }

    if(typeof req.body.username == "undefined" || req.body.username.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Vyplňte všechny údaje",
            error_field: "username"
        });
        return;
    }

    if(typeof req.body.password == "undefined" || req.body.password.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Vyplňte všechny údaje",
            error_field: "password"
        });
        return;
    }

    if(typeof req.body.password_repeat == "undefined" || req.body.password_repeat.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Vyplňte všechny údaje",
            error_field: "password_repeat"
        });
        return;
    }

    if(req.body.password_repeat != req.body.password) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: "Hesla se neschodují",
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
                message: "Nepodařilo se vytvořit uživatele",
                hint: "Zkontrolujte log aplikace"
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
                message: "Nepodařilo se vytvořit uživatele",
                hint: "Zkontrolujte log aplikace"
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
                message: "Nepodařilo se zapsat údaje do konfiguračního souboru",
                hint: "Zkontrolujte log aplikace"
            });
            return;
        }

        console.log(`First user "${req.body.username}" was successfully created`);
    
        res.status(200).json({
            success: true,
            status: 200,
            message: "Uživatel byl úspěšně vytvořen"
        });
        return;
    });
});

module.exports = router;