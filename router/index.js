const express = require("express");

const router = express.Router();

router.use("/wxmini", require("./wxmini"));
router.use("/userinfo", require("./userinfo"));
router.use("/violate", require("./violate"));
router.use("/road", require("./road"));
// router.use('/qq', require('./qq'))

module.exports = router;
