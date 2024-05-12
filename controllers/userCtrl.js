const User = require("../model/User");
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
const userCtrl = {
  searchUser: async (req, res) => {
    try {
      const users = await User.find({
        username: { $regex: req.query.username },
      })
        .limit(10)
        .select("username fullname profilePicture");

      return res.json({ users });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getUsersByAdmin: async (req, res) => {
    try {
      const features = new APIfeatures(User.find(), req.query);

      const users = await features.query.sort("-createdAt");
      // .populate("user likes", "profilePicture username fullname followers")
      // .populate({
      //   path: "comments",
      //   populate: {
      //     path: "user like",
      //     select: "-password",
      //   },
      // });
      return res.status(200).json({
        msg: "Success!",
        result: users.length,
        users,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select("-password")
        .populate("followers followings", "-password");
      if (!user) return res.status(400).json({ msg: "User not found" });
      return res.status(200).json({ user });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { fullname, desc, city, profilePicture } = req.body;

      // valid username
      if (!fullname)
        return res.status(400).json({ msg: "Please enter your fullName!" });

      const user = await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          fullname,
          desc,
          city,
          profilePicture,
        }
      );
      return res.status(200).json({ msg: "Updated User!" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  followUser: async (req, res) => {
    try {
      const user = await User.find({
        _id: req.params.id,
        followers: req.user._id,
      });
      if (user.length > 0)
        return res.status(400).json({ msg: "You followed this user." });

      const newUser = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: { followers: req.user._id },
        },
        { new: true }
      ).populate("followers followings", "-password");
      await User.findByIdAndUpdate(
        { _id: req.user._id },
        {
          $push: { followings: req.params.id },
        },
        { new: true }
      );
      return res.status(200).json({ msg: "followed!", newUser });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  unFollowUser: async (req, res) => {
    try {
      const newUser = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pull: { followers: req.user._id },
        },
        { new: true }
      ).populate("followers followings", "-password");
      await User.findByIdAndUpdate(
        { _id: req.user._id },
        {
          $pull: { followings: req.params.id },
        },
        { new: true }
      );
      return res.status(200).json({ msg: "unFollowed!", newUser });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  suggestionsUser: async (req, res) => {
    try {
      const newArr = [...req.user.followings, req.user._id];

      const num = req.query.num || 10;

      const users = await User.aggregate([
        { $match: { _id: { $nin: newArr } } },
        { $sample: { size: Number(num) } },
        {
          $lookup: {
            from: "user",
            localField: "followers",
            foreignField: "_id",
            as: "followers",
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "followings",
            foreignField: "_id",
            as: "followings",
          },
        },
      ]).project("-password");

      return res.json({
        users,
        result: users.length,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = userCtrl;
