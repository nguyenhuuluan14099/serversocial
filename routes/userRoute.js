const userCtrl = require("../controllers/userCtrl");

const router = require("express").Router();
const auth = require("../middleware/auth");

router.get("/search", auth, userCtrl.searchUser);

router.get("/user/:id", auth, userCtrl.getUser);

router.get("/usersByAdmin", auth, userCtrl.getUsersByAdmin);

router.put("/user", auth, userCtrl.updateUser);

router.put("/user/follow/:id", auth, userCtrl.followUser);

router.put("/user/unfollow/:id", auth, userCtrl.unFollowUser);

router.get("/suggestUser", auth, userCtrl.suggestionsUser);

module.exports = router;
