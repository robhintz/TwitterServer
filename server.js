const express = require("express");
// const session = require("express-session");
// const methodOverride = require("method-override");
/////////////////////////////////////////////////////
const app = express();
const PORT = 3003;
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

app.use(express.json());
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));

const tweetsController = require("./controllers/tweets.js");
app.use("/tweets", tweetsController);

const usersController = require("./controllers/users.js");
app.use("/users", usersController);
///
mongoose.connection.once("open", () => {
  console.log("connected to mongoose...");
});

mongoose.connection.on("error", (err) => {
  console.log(err.message);
});
mongoose.connection.on("disconnected", () => {
  console.log("disconnected");
});

app.listen(PORT, () => {
  console.log("Listening on", PORT);
});
