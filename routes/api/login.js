const localization = require("../../libs/localization");
const DB = require("../../libs/db");
const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/", async (req, res) => {
    const local = new localization();

    if(typeof req.body.username == "undefined" || req.body.username.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().login.fill_all_fields,
            error_field: "username"
        });
        return;
    }

    if(typeof req.body.password == "undefined" || req.body.password.replaceAll(" ", "") == "") {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().login.fill_all_fields,
            error_field: "password"
        });
        return;
    }

    let userData;
    const db = new DB();

    try {
        userData = await db.query("SELECT * FROM users WHERE username = $1", [ req.body.username ]);
    }

    catch(e) {
        console.error(e);

        res.status(500).json({
            success: false,
            status: 500,
            error: "Internal Server Error",
        });
        return;
    }

    if(userData.rowCount == 0) {
        res.status(400).json({
            success: false,
            status: 400,
            error: "Bad Request",
            message: local.getTranslation().login.check_username_password
        });
        return;
    }

    bcrypt.compare(req.body.password, userData.rows[0].password, (err, result) => {
        if(err) {
            console.error(err);
    
            res.status(500).json({
                success: false,
                status: 500,
                error: "Internal Server Error",
                message: local.getTranslation().login.login_failed
            });
            return;
        }

        if(result == false) {
            res.status(400).json({
                success: false,
                status: 400,
                error: "Bad Request",
                message: local.getTranslation().login.check_username_password
            });
            return;
        }

        req.session.loged_in = true;
        req.session.username = userData.rows[0].username;

        res.json({
            success: true,
            message: local.getTranslation().login.successful_login
        });
    });
});

router.delete("/", async (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            console.error(err);

            res.status(500).json({
                success: false,
                status: 500,
                error: "Internal Server Error",
                message: local.getTranslation().login.logout_failed
            });
            return;
        }
    });

    res.json({
        success: true,
        message: local.getTranslation().login.successful_logout
    });
});

module.exports = router;