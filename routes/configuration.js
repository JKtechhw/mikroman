const configEditor = require("../libs/configEditor");
const local = require("../libs/localization");
const express = require("express");
const router = express.Router();
const ce = new configEditor();

const localization = new local();

router.use(express.static("public"));

router.use("*", (req, res, next) => {
    const mode = req.app.get("mode");
    if(mode == "configuration") {
        next();
        return;
    }

    res.status(403).render("configuration/error", {
        errorCode: 403,
        errorParagraphs: [
            localization.getTranslation().configuration.finished_configuration,
        ],
        translation: localization.getTranslation().configuration
    });
    return;
});

router.get("/", (req, res) => {
    const configured = req.app?.locals?.configured || false;
    if(configured == true) {
        next();
    }

    let configData;
    try {
        configData = ce.getConfig();
    }

    catch(e) {
        res.status(500).render("configuration/error", {
            errorCode: 500,
            errorParagraphs: [
                localization.getTranslation().configuration.config_file_error,
                localization.getTranslation().configuration.config_file_hint
            ],
        });
    }

    if(Object.keys(configData).includes("configured") && configData.configured == true) {
        res.render("configuration/finish", {
            translation: localization.getTranslation().configuration
        });
    }

    else if(
        Object.keys(configData).includes("db_host") &&
        Object.keys(configData).includes("db_name") &&
        Object.keys(configData).includes("db_port") &&
        Object.keys(configData).includes("db_user") &&
        Object.keys(configData).includes("db_password")
    ) {
        res.render("configuration/user", {
            translation: localization.getTranslation().configuration
        });
    }

    else if(
        Object.keys(configData).includes("language") &&
        Object.keys(configData).includes("country")
    ) {
        res.render("configuration/database", {
            db_host: configData.db_host || "",
            db_port: configData.db_port || "",
            db_name: configData.db_name || "",
            db_user: configData.db_user || "",
            db_password: configData.db_password || "",
            translation: localization.getTranslation().configuration
        });
    }
    
    else {
        res.render("configuration/localization", {
            languages: localization.getLanguages(),
            countries: localization.getCountries(),
            translation: localization.getTranslation().configuration
        });
    }
});

router.use("*", (req, res) => {
    res.status(404).render("configuration/error", {
        errorCode: 404,
        errorParagraphs: [
            localization.getTranslation().http_errors["404"]
        ],
        translation: localization.getTranslation()
    });
});

module.exports = router;