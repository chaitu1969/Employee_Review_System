const express = require("express");
const router = express.Router();

console.log("Router reloaded");

router.use("/", require("./users"));
router.use("/review", require("./reviews"));

module.exports = router;
