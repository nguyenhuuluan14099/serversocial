const Comment = require("../model/Comment");
const Post = require("../model/Post");
const commentCtrl = {
  createComment: async (req, res) => {
    try {
      const { postId, content, reply, tag } = req.body;

      const newComment = new Comment({
        user: req.user._id,
        content,
        reply,
        tag,
      });

      await Post.findOneAndUpdate(
        { _id: postId },
        {
          $push: { comments: newComment._id },
        }
      );

      await newComment.save();
      return res.status(200).json({ newComment });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  deleteComment: async (req, res) => {
    const cmt = await Comment.findById(req.params.id);
    try {
      await cmt.deleteOne();
      return res.status(200).json("Deleted! comment");
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  likeComment: async (req, res) => {
    try {
      const comment = await Comment.find({
        _id: req.params.id,
        likes: req.user._id,
      });
      if (comment.length > 0)
        return res.status(400).json({ msg: "You liked this comment." });

      await Comment.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: { like: req.user._id },
        },
        { new: true }
      );

      return res.status(200).json({ msg: "Liked comment." });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  unLikeComment: async (req, res) => {
    try {
      await Comment.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pull: { like: req.user._id },
        },
        { new: true }
      );

      return res.status(200).json({ msg: "UnLiked comment." });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};

module.exports = commentCtrl;
