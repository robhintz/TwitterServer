const express = require("express");
const tweets = express.Router();
const mongoose = require("mongoose");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

const tweetsConn = mongoose.createConnection(
  "mongodb://localhost:27017/tweets",
  options
);
const Tweet = tweetsConn.model("Tweet", require("../models/tweets.jsx"));

Tweet.init();

// index
tweets.get("/", (req, res) => {
  Tweet.find({}, (err, foundTweets) => {
    if (err) {
      console.log(err.message);
    } else {
      res.status(200).json(foundTweets);
    }
  });
});

tweets.get("/by-user/:id", (req, res) => {
  console.log("getting user tweets.");
  Tweet.find({ author: req.params.id }, (err, foundTweets) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log(foundTweets);
      res.status(200).json(foundTweets);
    }
  });
});

// create
tweets.post("/", (req, res) => {
  Tweet.create(
    {
      author: req.body.author,
      text: req.body.text,
      authorName: req.body.authorName,
      replyTo: req.body.replyTo,
    },
    (error, createdTweet) => {
      if (error) {
        console.log(error.message);
      } else {
        res.status(200).send(createdTweet);
      }
    }
  );
});

tweets.patch("/reply", (req, res) => {
  console.log(
    `replying. original: ${req.body.originalId}, reply: ${req.body.replyId}`
  );

  Tweet.findById(req.body.originalId, (error, foundTweet) => {
    console.log("found tweet", foundTweet);

    Tweet.findOneAndUpdate(
      { _id: req.body.originalId },
      {
        replies: [...foundTweet.replies, `${req.body.replyId}`],
      },
      (error, updatedTweet) => {
        if (error) {
          console.log(error.message);
        } else {
          console.log("updated tweet", updatedTweet);
          res.status(200).send(updatedTweet);
        }
      }
    );
  });
});

// update
tweets.put("/:id", (req, res) => {
  console.log("server put", req.params.id);
  console.log("body", req.body);
  Tweet.findOneAndUpdate(
    { _id: req.params.id },
    { title: req.body.title, url: req.body.url },
    { new: true },
    (error, updatedTweet) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log(updatedTweet);
        res.status(200).json(updatedTweet);
      }
    }
  );
});

tweets.patch("/edit", (req, res) => {
  console.log("begin edit tweet", req.body);

  Tweet.findOneAndUpdate(
    { _id: req.body.tweetId },
    { text: req.body.tweetText },
    (error, updatedTweet) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log(updatedTweet);
        res.status(200).json(updatedTweet);
      }
    }
  );
});

tweets.patch("/:id/like", (req, res) => {
  console.log("beginning like function", req.body);

  Tweet.findById(req.params.id, (err, foundTweet) => {
    if (err) {
      console.log(err.message);
    } else {
      // get likes from foundTweet
      // also has to be a user function.
      if (req.body.bool) {
        // liking tweet
        Tweet.findOneAndUpdate(
          { _id: req.params.id },
          { likes: [...foundTweet.likes, req.body.uid] },
          { new: true },
          (error, updatedTweet) => {
            if (error) {
              console.log(error.message);
            } else {
              console.log(updatedTweet);
              res.status(200).json(updatedTweet);
            }
          }
        );
      } else {
        // unliking tweet
        let arr = [...foundTweet.likes].splice(
          foundTweet.likes.indexOf(req.params.id),
          1
        );
        Tweet.findOneAndUpdate(
          { _id: req.params.id },
          { likes: [...arr] },
          { new: true },
          (error, updatedTweet) => {
            if (error) {
              console.log(error.message);
            } else {
              console.log(updatedTweet);
              res.status(200).json(updatedTweet);
            }
          }
        );
      }
    }
  });
});

// delete
tweets.delete("/:id", (req, res) => {
  Tweet.findByIdAndRemove(req.params.id, (error, deletedTweet) => {
    if (error) {
      console.log(error.message);
    } else {
      res.status(200).json(deletedTweet);
    }
  });
});

module.exports = tweets;
