const express = require("express");
const users = express.Router();
const mongoose = require("mongoose");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

const usersConn = mongoose.createConnection(
  "mongodb://localhost:27017/users",
  options
);
const User = usersConn.model("User", require("../models/users.jsx"));

// const { create } = require("../models/users.jsx");

User.init();

// index
users.get("/", (req, res) => {
  User.find({}, (err, foundUsers) => {
    if (err) {
      console.log(err.message);
    } else {
      res.status(200).json(foundUsers);
    }
  });
});

users.get("/:id", (req, res) => {
  User.findById(req.params.id, (err, foundUser) => {
    if (err) {
      console.log(err.message);
    } else {
      res.status(200).json(foundUser);
    }
  });
});

users.post("/sign-in", (req, res) => {
  User.find({ email: req.body.email }, (err, foundUsers) => {
    console.log("signing in", foundUsers);
    if (err) {
      console.log(err.message);
    } else {
      res.status(200).json(foundUsers);
    }
  });
});

users.post("/newPost/:userId/:postId", (req, res) => {
  console.log("adding tweet");
  console.log(req.body);
  User.findById(req.params.userId, (err, foundUser) => {
    console.log("user who tweeted:", foundUser);
    if (err) {
      console.log(err.message);
    } else {
      // res.status(200).json(foundUsers);
      console.log(foundUser);
      User.findByIdAndUpdate(
        req.params.userId,
        {
          tweets: [...foundUser.tweets, req.params.postId],
        },
        (err, updatedUser) => {
          if (err) {
            console.log(err);
          } else {
            res.status(200).json(updatedUser);
          }
        }
      );
    }
  });
});

// create
users.post("/create", (req, res) => {
  console.log(req.body);

  User.find({ email: req.body.email }, (err, foundUsers) => {
    if (err) {
      console.log(err.message);
    } else {
      if (foundUsers[0]) {
        console.log("found user", foundUsers[0]);
        res.status(200).send({ error: "user already exists" });
      } else {
        console.log("user doesn't exist yet");
        User.create(req.body, (error, createdUser) => {
          if (error) {
            console.log(error.message);
          } else {
            res.status(200).send(createdUser);
          }
        });
      }
    }
  });
});

// delete
users.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id, (error, deletedUser) => {
    if (error) {
      console.log(error.message);
    } else {
      res.status(200).json(deletedUser);
    }
  });
});

users.patch("/:id/like", (req, res) => {
  let tweetId = req.params.id;
  let uid = req.body.uid;
  let bool = req.body.bool;
  console.log("beginning like function", req.body, req.params.id);

  User.findById(uid, (err, foundUser) => {
    if (err) {
      console.log(err.message);
    } else {
      // get likes from foundTweet
      // also has to be a user function.
      if (bool) {
        // liking tweet
        User.findOneAndUpdate(
          { _id: uid },
          { likes: [...foundUser.likes, tweetId.toString()] },
          (error, updatedUser) => {
            if (error) {
              console.log(error.message);
            } else {
              console.log(updatedUser);
              res.status(200).json(updatedUser);
            }
          }
        );
      } else {
        // unliking tweet
        let arr = [...foundUser.likes].splice(
          foundUser.likes.indexOf(tweetId),
          1
        );
        User.findOneAndUpdate(
          { _id: uid },
          { likes: [...arr] },
          (error, updatedUser) => {
            if (error) {
              console.log(error.message);
            } else {
              console.log(updatedUser);
              res.status(200).json(updatedUser);
            }
          }
        );
      }
    }
  });
});

users.put("/edit", (req, res) => {
  console.log("editting account", req.body);
  let uid = req.body.uid;
  let newBio = req.body.newBio;
  let newUrl = req.body.newUrl;

  User.findByIdAndUpdate(
    uid,
    { bio: newBio.toString(), photoUrl: newUrl.toString() },
    (error, updatedUser) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log(updatedUser);
        res.status(200).json(updatedUser);
      }
    }
  );
});

// update
users.put("/:id", (req, res) => {
  console.log("server put", req.params.id);
  console.log("body", req.body);
  User.findOneAndUpdate(
    { _id: req.params.id },
    { title: req.body.title, url: req.body.url },
    { new: true },
    (error, updatedUser) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log(updatedUser);
        res.status(200).json(updatedUser);
      }
    }
  );
});
module.exports = users;
