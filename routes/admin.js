'use strict';

const local = require("../libs/localization");
const express = require("express");
const router = express.Router();

const localization = new local();

router.get("/", (req, res, next) => {
    const mode = req.app.get("mode");
    if(mode == "configuration") {
        res.render("configuration/configurationWarn", {
            translation: localization.getTranslation().configuration
        });
        return;
    }

    next();
});

router.get("/", (req, res) => {
    if(typeof req.session.loged_in == "undefined" || req.session.loged_in == false) {
        res.render("login/login", {
            translation: localization.getTranslation().login
        });
        return;
    }

    res.render("admin/dashboard", {
        title: "Dashboard"
    });
});

module.exports = router;