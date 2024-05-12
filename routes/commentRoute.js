const commentCtrl = require("../controllers/commentCtrl");
const auth = require("../middleware/auth");

const router = require("express").Router();

router.post("/comments", auth, commentCtrl.createComment);

router.delete("/comment/:id", auth, commentCtrl.deleteComment);

router.put("/comments/:id/like", auth, commentCtrl.likeComment);

router.put("/comments/:id/unLike", auth, commentCtrl.unLikeComment);

module.exports = router;
