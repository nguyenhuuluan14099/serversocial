const Posts = require("../model/Post");
const User = require("../model/User");
const Comment = require("../model/Comment");

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const postCtrl = {
  getUserPosts: async (req, res) => {
    try {
      const features = new APIfeatures(
        Posts.find({ userId: req.params.id }),
        req.query
      ).paginating();
      const posts = await features.query
        .sort("-createdAt")
        .populate("user likes", "profilePicture username fullname followers")
        .populate({
          path: "comments",
          populate: {
            path: "user like",
            select: "-password",
          },
        });

      return res.status(200).json({
        posts,
        result: posts.length,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  createPost: async (req, res) => {
    try {
      const { img, desc, location, hideLike, hideComment, userId } = req.body;
      if (!img)
        return res.status(400).json({ msg: "Please choose your picture!" });

      const newPost = new Posts({
        img,
        desc,
        location,
        hideLike,
        hideComment,
        userId,
        user: req.user._id,
      });
      await newPost.save();
      return res.status(200).json({
        msg: "Created Post",
        newPost,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Posts.findById(req.params.id)
        .populate(
          "user likes",
          "profilePicture username fullname followers isAdmin"
        )
        .populate({
          path: "comments",
          populate: {
            path: "user like",
            select: "-password",
          },
        });
      if (!post) return res.status(400).json({ msg: "Post does not exist" });

      return res.status(200).json({ post });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getPostsByAdmin: async (req, res) => {
    try {
      const features = new APIfeatures(Posts.find(), req.query);

      const posts = await features.query
        .sort("-createdAt")
        .populate("user likes", "profilePicture username fullname followers")
        .populate({
          path: "comments",
          populate: {
            path: "user like",
            select: "-password",
          },
        });
      return res.status(200).json({
        msg: "Success!",
        result: posts.length,
        posts,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getPosts: async (req, res) => {
    try {
      const features = new APIfeatures(
        Posts.find({
          user: [...req.user.followings, req.user._id],
        }),
        req.query
      ).paginating();

      const posts = await features.query
        .sort("-createdAt")
        .populate("user likes", "profilePicture username fullname followers")
        .populate({
          path: "comments",
          populate: {
            path: "user like",
            select: "-password",
          },
        });
      return res.status(200).json({
        msg: "Success!",
        result: posts.length,
        posts,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  updatePost: async (req, res) => {
    try {
      const { img, location, hideComment, hideLike, desc } = req.body;
      const post = await Posts.findOneAndUpdate(
        { _id: req.params.id },
        req.body
      )
        .populate("user likes", "profilePicture username fullname followers")
        .populate({
          path: "comments",
          populate: {
            path: "user like",
            select: "-password",
          },
        });
      return res.status(200).json({
        msg: "Updated!",
        newPost: {
          ...post._doc,
          img,
          location,
          hideComment,
          hideLike,
          desc,
        },
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  deletePost: async (req, res) => {
    const post = await Posts.findById(req.params.id);
    try {
      await post.deleteOne();
      await Comment.deleteMany({ _id: { $in: post.comments } });
      return res.status(200).json({
        msg: "Deleted post!",
        newPost: post,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  likePost: async (req, res) => {
    try {
      const post = await Posts.findById(req.params.id);
      if (!post.likes.includes(req.user._id)) {
        await post.updateOne({ $push: { likes: req.user._id } });
        return res.status(200).json({ msg: "Liked post!" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  unLikePost: async (req, res) => {
    try {
      const post = await Posts.findById(req.params.id);
      if (post.likes.includes(req.user._id)) {
        await post.updateOne({ $pull: { likes: req.user._id } });
        return res.status(200).json({ msg: "UnLiked post!" });
      }
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  savedPost: async (req, res) => {
    try {
      const user = await User.find({ _id: req.user._id, saved: req.params.id });
      if (user.length > 0)
        return res.status(400).json({ msg: "You saved this post." });

      const save = await User.findByIdAndUpdate(
        { _id: req.user._id },
        {
          $push: { saved: req.params.id },
        },
        { new: true }
      );
      if (!save)
        return res.status(400).json({ msg: "This user does not exist." });
      return res.status(200).json({ msg: "Saved!" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  unSavedPost: async (req, res) => {
    try {
      const save = await User.findByIdAndUpdate(
        { _id: req.user._id },
        {
          $pull: { saved: req.params.id },
        },
        { new: true }
      );
      if (!save)
        return res.status(400).json({ msg: "This user does not exist." });
      return res.status(200).json({ msg: "UnSaved!" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getSavedPost: async (req, res) => {
    try {
      const features = new APIfeatures(
        Posts.find({
          _id: { $in: req.user.saved },
        }),
        req.query
      ).paginating();
      const savedPosts = await features.query.sort("-createdAt");
      return res.status(200).json({
        savedPosts,
        result: savedPosts.length,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getPostExplore: async (req, res) => {
    try {
      const newArr = [...req.user.followings, req.user._id];
      const num = req.query.num || 9;
      const posts = await Posts.aggregate([
        { $match: { user: { $nin: newArr } } },
        { $sample: { size: Number(num) } },
      ]);
      return res.status(200).json({
        msg: "Success!",
        posts,
        result: posts.length,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};
module.exports = postCtrl;
