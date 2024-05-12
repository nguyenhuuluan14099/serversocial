const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

app.use(bodyParser.json());
app.use(
  cors({
    origin: "https://socialclient.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());

//middleware
require("dotenv").config();

app.get("/", (req, res) => {
  res.json({ msg: "hello server" });
});

const port = process.env.PORT || 5000;

//socket
const http = require("http").createServer(app);

//import router

app.use("/api", require("./routes/authRoute"));
app.use("/api", require("./routes/userRoute"));
app.use("/api", require("./routes/postRoute"));
app.use("/api", require("./routes/commentRoute"));
app.use("/api", require("./routes/notifyRoute"));
app.use("/api", require("./routes/messageRoute"));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
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

http.listen(port, () => console.log(`server is running with port ${port}`));
