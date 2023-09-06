const configEditor = require("../libs/configEditor");
const express = require("express");
const router = express.Router();
const ce = new configEditor();

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
            "Konfigurace byla již dokončena.",
        ]
    });
    return;
});

router.use("/", (req, res) => {
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
                "Nepodařilo se přečíst hodnoty z konfiguračního souboru. Ujistěte se že konfigurační soubor existuje.",
                "Pro automatické vytvoření konfiguračního souboru restartujte aplikaci."
            ]
        });
    }

    if(Object.keys(configData).includes("configured") && configData.configured == true) {
        res.render("configuration/finish");
    }

    else if(
        Object.keys(configData).includes("db_host") &&
        Object.keys(configData).includes("db_name") &&
        Object.keys(configData).includes("db_port") &&
        Object.keys(configData).includes("db_user") &&
        Object.keys(configData).includes("db_password")
    ) {
        res.render("configuration/user");
    }
    
    else {
        res.render("configuration/database", {
            db_host: configData.db_host || "",
            db_port: configData.db_port || "",
            db_name: configData.db_name || "",
            db_user: configData.db_user || "",
            db_password: configData.db_password || "",
        });
    }
});

router.use("*", (req, res) => {
    res.status(404).render("configuration/error", {
        errorCode: 404,
        errorParagraphs: [
            "Stránka neexistuje",
        ]
    });
});

module.exports = router;