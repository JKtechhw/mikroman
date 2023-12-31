const bodyParser = require('body-parser'); 
const express = require("express");
const router = express.Router();

const configurationRouter = require("./configuration");
const defaultRouter = require("./default");
const adminRouter = require("./admin");
const apiRouter = require("./api");

router.use(bodyParser.json()); 
router.use(bodyParser.urlencoded({ extended: false })); 

router.use(express.static("public"));

router.use("/api", apiRouter);
router.use("/", adminRouter);

router.use("/configuration", configurationRouter);

router.use("*", defaultRouter);

module.exports = router;