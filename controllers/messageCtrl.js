const Conversations = require("../model/Conversation");
const Message = require("../model/Message");

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
const messageCtrl = {
  createMessage: async (req, res) => {
    const { sender, recipient, text, media } = req.body;
    if (!recipient || (!text?.trim() && media.length === 0)) return;

    const conversation = await Conversations.findOneAndUpdate(
      {
        $or: [
          { recipients: [sender, recipient] },
          { recipients: [recipient, sender] },
        ],
      },
      {
        recipients: [recipient, sender],
        text,
        media,
      },
      {
        upsert: true,
        new: true,
      }
    );
    const newMessage = new Message({
      conversation: conversation._id,
      sender,
      text,
      recipient,
      media,
    });
    await newMessage.save();
    return res
      .status(200)
      .json({ msg: "create success!", messId: newMessage._id });
  },
  getConversations: async (req, res) => {
    try {
      const features = new APIfeatures(
        Conversations.find({
          recipients: req.user._id,
        }),
        req.query
      ).paginating();
      const conversations = await features.query
        .sort("-updatedAt")
        .populate("recipients", "username fullname createdAt profilePicture");

      return res.status(200).json({
        conversations,
        result: conversations.length,
      });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  getMessages: async (req, res) => {
    try {
      const features = new APIfeatures(
        Message.find({
          $or: [
            { sender: req.user._id, recipient: req.params.id },
            { sender: req.params.id, recipient: req.user._id },
          ],
        }),
        req.query
      ).paginating();
      const messages = await features.query.sort("-createdAt");
      return res.status(200).json({
        messages,
        result: messages.length,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteMessage: async (req, res) => {
    try {
      const mess = await Message.findByIdAndDelete(req.params.id);
      return res
        .status(200)
        .json({ msg: "Deleted Message!", deletedMessId: mess._id });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
  deleteConversation: async (req, res) => {
    try {
      const newCon = await Conversations.findOneAndDelete({
        $or: [
          { recipients: [req.user._id, req.params.id] },
          { recipients: [req.params.id, req.user._id] },
        ],
      });
      await Message.deleteMany({ conversation: newCon._id });

      return res.status(200).json({ msg: "Deleted conversation!" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = messageCtrl;
