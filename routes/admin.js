const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
    const mode = req.app.get("mode");
    if(mode == "configuration") {
        res.render("configuration/configurationWarn");
        return;
    }

    next();
});

router.get("/", (req, res) => {
    if(typeof req.session.loged_in == "undefined" || req.session.loged_in == false) {
        res.render("login/login");
        return;
    }

    res.render("admin/dashboard", {
        title: "Dashboard"
    });
});

module.exports = router;