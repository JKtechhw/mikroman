const express = require("express");
const router = express.Router();

const installApiRouter = require("./api/installation");
const loginApiRouter = require("./api/login");

router.use("/installation", installApiRouter);
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