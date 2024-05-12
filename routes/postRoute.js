const postCtrl = require("../controllers/postCtrl");
const auth = require("../middleware/auth");

const router = require("express").Router();
router
  .route("/posts")
  .post(auth, postCtrl.createPost)
  .get(auth, postCtrl.getPosts);

router.get("/postsByAdmin", auth, postCtrl.getPostsByAdmin);

router
  .route("/post/:id")
  .get(auth, postCtrl.getPost)
  .put(auth, postCtrl.updatePost)
  .delete(auth, postCtrl.deletePost);

router.put("/post/:id/like", auth, postCtrl.likePost);

router.put("/post/:id/unLike", auth, postCtrl.unLikePost);

router.get("/users_post/:id", auth, postCtrl.getUserPosts);

router.get("/getSavedPosts", auth, postCtrl.getSavedPost);

router.get("/postExplore", auth, postCtrl.getPostExplore);

router.put("/post/saved/:id", auth, postCtrl.savedPost);

router.put("/post/unSaved/:id", auth, postCtrl.unSavedPost);

module.exports = router;
