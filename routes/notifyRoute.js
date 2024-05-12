const notifyCtrl = require("../controllers/notifyCtrl");
const auth = require("../middleware/auth");
const router = require("express").Router();

router.post("/notify", auth, notifyCtrl.createNotify);

router.delete("/notify/:id", auth, notifyCtrl.deleteNotify);

router.get("/notifies", auth, notifyCtrl.getNotifies);

router.put("/isReadNotify/:id", auth, notifyCtrl.isReadNotify);

router.delete("/deleteAllNotify", auth, notifyCtrl.deleteAllNotify);

module.exports = router;
