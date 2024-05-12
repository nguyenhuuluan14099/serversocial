const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authCtrl = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).populate(
        "followers followings",
        "profilePicture username fullname  followers followings"
      );
      if (!user)
        return res.status(400).json({ msg: "This email does not exist." });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Password is incorrect." });

      const refresh_token = createRefreshToken({ id: user._id });
      const access_token = createAccessToken({ id: user._id });

      return res.status(200).json({
        msg: "Login Success!",
        access_token,
        refresh_token,
        user: {
          ...user._doc,
          password: "",
        },
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  register: async (req, res) => {
    try {
      const { fullname, username, email, password, desc, city, relationship } =
        req.body;
      const newUsername = username.toLowerCase().replace(/ /g, " ");
      //generate username
      const user_name = await User.findOne({ username: newUsername });
      if (user_name)
        return res.status(400).json({ msg: "This username already exist." });

      const user_email = await User.findOne({ email });
      if (user_email)
        return res.status(400).json({ msg: "This email already exist." });

      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters" });

      const hashPassword = await bcrypt.hash(password, 12);

      const newUser = new User({
        fullname,
        username: newUsername,
        email,
        password: hashPassword,
        desc,
        city,
        relationship,
      });
      const refresh_token = createRefreshToken({ id: newUser._id });
      const access_token = createAccessToken({ id: newUser._id });

      await newUser.save();
      return res.status(200).json({
        msg: "Registered!",
        access_token,
        refresh_token,
        user: {
          ...newUser._doc,
          password: "",
        },
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  generateAccessToken: (req, res) => {
    try {
      const rf_token = req.params.rf_token;
      if (!rf_token) return res.status(400).json({ msg: "Please login now!" });
      jwt.verify(
        rf_token,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, result) => {
          if (err) return res.status(400).json({ msg: "Please login now!" });
          const user = await User.findById(result.id)
            .select("-password")
            .populate(
              "followings followers",
              "profilePicture username fullname followings followers"
            );
          if (!user)
            return res.status(400).json({ msg: "This does not exist." });

          const access_token = createAccessToken({ id: result.id });

          return res.status(200).json({
            access_token,
            user,
          });
        }
      );
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};
module.exports = authCtrl;
