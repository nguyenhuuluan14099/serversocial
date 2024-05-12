const authCtrl = require("../controllers/authCtrl");

const router = require("express").Router();

router.post("/register", authCtrl.register);

router.post("/login", authCtrl.login);

router.post("/refresh_token/:rf_token", authCtrl.generateAccessToken);

module.exports = router;
