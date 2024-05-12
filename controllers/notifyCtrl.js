const Notifies = require("../model/Notify");

const notifyCtrl = {
  createNotify: async (req, res) => {
    try {
      const { id, recipients, text, content, image, url } = req.body;
      if (recipients.includes(req.user._id.toString())) return;

      const notify = new Notifies({
        id,
        recipients,
        text,
        content,
        image,
        url,
        user: req.user._id,
      });
      await notify.save();
      return res.json({ notify });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  deleteNotify: async (req, res) => {
    // const notify = await Notifies.findById(req.params.id);

    try {
      // notify.deleteOne();
      const notify = await Notifies.findOneAndDelete({
        id: req.params.id,
        url: req.query.url,
      });
      return res.json({ notify });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getNotifies: async (req, res) => {
    try {
      const notifies = await Notifies.find({ recipients: req.user._id })
        .sort("-createdAt")
        .populate("user", "profilePicture username fullname");
      return res.status(200).json({ notifies });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  isReadNotify: async (req, res) => {
    try {
      const notify = await Notifies.findOneAndUpdate(
        { _id: req.params.id },
        { isRead: true }
      );
      return res.status(200).json({ notify });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  deleteAllNotify: async (req, res) => {
    try {
      const notify = await Notifies.deleteMany({ recipients: req.user._id });
      return res.status(200).json({ notify });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};
module.exports = notifyCtrl;
