const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      require: true,
      trim: true,
      maxlength: 25,
    },
    username: {
      type: String,
      require: true,
      unique: true,
      trim: true,
      maxlength: 25,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: Array,
      default: [
        {
          imageUrl: "https://i.ibb.co/1dSwFqY/download-1.png",
          imageId: "09327837823",
          imageThumb: "https://i.ibb.co/1dSwFqY/download-1.png",
        },
      ],
    },
    coverPicture: {
      type: Object,
      default: [
        {
          imageUrl: "https://i.ibb.co/1dSwFqY/download-1.png",
          imageId: "09327837823",
          imageThumb: "https://i.ibb.co/1dSwFqY/download-1.png",
        },
      ],
    },
    followers: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    followings: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBlock: {
      type: Boolean,
      default: false,
    },
    desc: {
      type: String,
      max: 50,
    },
    city: {
      type: String,
      max: 50,
    },
    saved: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    relationship: {
      type: Number,
      enum: [1, 2, 3],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", UserSchema);
