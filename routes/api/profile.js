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
const validatorExperienceInput = require("../../validation/experience");
const validatorEducationInput = require("../../validation/education");
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
//@route    GET api/profile/all
//@desc     get all profiles
//@access   public access
router.get('/all',
  (req, res) => {
    const errors = {};

    Profile.find()
      .populate('user', ['name', 'avatar'])
      .then(profiles => {
        if(!profiles) {
          errors.noprofile = 'There are no profiles';
          res.status(404).json(errors);
        }

        res.json(profiles);
      })
      .catch(err => res.status(404).json({profile: 'There are no profiles'}));
  }
);
//@route    GET api/profile/handle/:handle
//@desc     get profile by handle
//@access   public access
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then((profile) => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch((err) => res.status(404).json(err));
});

//@route    GET api/profile/user/:user_id
//@desc     get profile by user ID
//@access   public access
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then((profile) => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch((err) =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

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

//@route    Post api/profile/experience
//@desc     add experience to profile
//@access   private access

router.post(
  "/experience",
  passsport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatorExperienceInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then((profile) => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };
      //Add to experience array
      profile.experience.unshift(newExp);
      profile.save().then((profile) => res.json(profile));
    });
  }
);

//@route    Post api/profile/education
//@desc     add education to profile
//@access   private access

router.post(
  "/education",
  passsport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatorEducationInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id }).then((profile) => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description,
      };
      //Add to experience array
      profile.education.unshift(newEdu);
      profile.save().then((profile) => res.json(profile));
    });
  }
);

//@route    DELETE api/profile/experience/:exp_id
//@desc     delete experience from profile
//@access   private access

router.delete(
  "/experience/:exp_id",
  passsport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      //Get remove index
      const removeIndex = profile.experience
        .map((item) => item.id)
        .indexOf(req.params.exp_id);
      //Splice out of array
      profile.experience.splice(removeIndex, 1);
      profile
        .save()
        .then((profile) => res.json(profile))
        .catch((err) => res.status(404).json(err));
    });
  }
);
//@route    DELETE api/profile/education/:edu_id
//@desc     delete education from profile
//@access   private access

router.delete(
  "/education/:edu_id",
  passsport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
      //Get remove index
      const removeIndex = profile.education
        .map((item) => item.id)
        .indexOf(req.params.edu_id);
      //Splice out of array
      profile.education.splice(removeIndex, 1);
      profile
        .save()
        .then((profile) => res.json(profile))
        .catch((err) => res.status(404).json(err));
    });
  }
);
//@route    DELETE api/profile
//@desc     delete user and profile
//@access   private access
router.delete(
  "/",
  passsport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: "true" })
      );
    });
  }
);


module.exports = router;
