const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId },
    user: { type: mongoose.Types.ObjectId, ref: "user" },
    desc: {
      type: String,
      max: 500,
    },
    img: {
      required: true,
      type: Array,
    },
    comments: [{ type: mongoose.Types.ObjectId, ref: "comment" }],
    likes: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    location: {
      type: String,
    },
    hideLike: {
      type: Boolean,
    },
    hideComment: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("post", PostSchema);
