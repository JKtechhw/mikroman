const express = require("express");
const router = express.Router();

const installApiRouter = require("./api/configuration");
const loginApiRouter = require("./api/login");

router.use("/configuration", installApiRouter);
router.use("/login", loginApiRouter);

//Error routes
router.get("*", (req, res) => {
    res.status(404).json({
        success: false,
        status: 404,
        error: "Not Found",
        message: "Stránka nenalezena"
    });
});

router.post("*", (req, res) => {
    res.status(404).json({
        success: false,
        status: 404,
        error: "Not Found",
        message: "Stránka nenalezena"
    });
});

module.exports = router;