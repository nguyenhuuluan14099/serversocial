const mongoose = require("mongoose");

const Comment = mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "user" },

    content: {
      type: String,
      require: true,
    },
    like: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    reply: {
      type: Array,
      default: [],
    },

    createdAt: {
      type: String,
      default: "",
    },
    tag: {
      type: Object,
    },
    reply: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("comment", Comment);
