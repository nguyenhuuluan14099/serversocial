const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(bodyParser.json());
app.use(cors());
//middleware
require("dotenv/config");

app.get("/", (req, res) => {
  res.send("we are go home");
});



const port = process.env.PORT || 5000;
//import router
const routerUser = require("./routes/user");
const routerConversation = require("./routes/conversations");
const routerMessage = require("./routes/message");
const routerPost = require("./routes/posts");
const routerComment = require("./routes/comment");
const routerNotification = require("./routes/notifications");
app.use("/users", routerUser);

app.use("/conversations", routerConversation);
app.use("/messages", routerMessage);
app.use("/posts", routerPost);
app.use("/comments", routerComment);
app.use("/notifications", routerNotification);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://serversocial.vercel.app");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => console.log("Connect database "))
  .catch((err) => console.log(err));

app.listen(port, () => console.log(`server is running with port ${port}`));
