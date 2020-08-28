const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const key = require("../../config/keys");
const passport = require("passport");

//Load Input Validation

const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
//Load User Model
const User = require("../../models/User.js");
//const passport = require("../../config/passport.js");
//@route    GET api/users/test
//@desc     tests users route
//@access   public access
router.get("/test", (req, res) => {
  res.json({ msg: "Users workss" });
});
//@route    GET api/users/register
//@desc     register a user
//@access   public acces

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  //Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      errors.email = "Email already exits";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size 200
        r: "pg", //rating pg,
        d: "mm", //default avatar is mm
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        avatar, //equivalent to avatar:avatar in ES6
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});
//@route    GET api/users/login
//@desc     rLogin User / Returning JWT JSON Web Token
//@access   public acces
router.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;

  const { errors, isValid } = validateLoginInput(req.body);
  //Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  //Find the user by email

  User.findOne({ email }).then((user) => {
    //check for user
    if (!user){
      errors.email ="User not found"
      return res.status(404).json(errors);
    }
    //Check password match
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        //User matched

        //Create JWT payload
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        };
        //Sign the token

        jwt.sign(
          payload,
          key.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: "true",
              token: "Bearer " + token,
            });
          }
        );
      } else {
        errors.password="Password  incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});
//@route    GET api/users/current
//@desc     return current user
//@access   private

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
  }
);

module.exports = router;
