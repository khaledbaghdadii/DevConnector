const express = require("express");
const mongoose = require("mongoose");
const passsport = require("passport");
//const keys = require("../../config/keys")

//Load profile model
const Profile = require("../../models/Profile");
//Load User Profile
const User = require("../../models/User");
const { default: validator } = require("validator");

//Load Validation
const validatorProfileInput = require("../../validation/profile");

const router = express.Router();
//@route    GET api/profile/test
//@desc     tests profile route
//@access   public access
router.get("/test", (req, res) => {
  res.json({ msg: "Profile workss" });
});

//@route    GET api/profile
//@desc     Get current user's profile
//@access   private access

router.get(
  "/",
  passsport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch((err) => res.status(400).json(err));
  }
);
//@route    POST api/profile
//@desc     create or edit user profile
//@access   private access

router.post(
  "/",
  passsport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatorProfileInput(req.body);
    //Check validator
    if (!isValid) {
      return res.status(400).json(errors);
    }
    //get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    //Skills split into an array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }
    //Social
    profileFields.social = {};

    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then((profile) => {
      if (profile) {
        //Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        )
          .populate("user", ["name", "avatar"])
          .then((profile) => res.json(profile));
      } else {
        //Create

        //Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then((profile) => {
          if (profile) {
            errors.handle = "That handle already exists";
            return res.status(400).json(errors);
          }
          //Save Profile
          new Profile(profileFields)
            .save()
            .then((profile) => res.json(profile));
        });
      }
    });
  }
);
module.exports = router;
