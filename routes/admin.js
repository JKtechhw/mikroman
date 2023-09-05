const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    if(typeof req.session.loged_in == "undefined" || req.session.loged_in == false) {
        res.render("admin/login");
        return;
    }

    res.render("admin/dashboard");
});

module.exports = router;