import express from "express";

// local imports
import auth from "../middleware/auth";
import User from "../models/User";
import Profile from "../models/Profile";
import validateProfileInput from "../validation/profile"

const router = express.Router();

// get profiles
router.get('/', auth, (req, res) => {
  const errors = {};

  Profile
    .findOne({ user: req.user.user._id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if(!profile) {
        errors.noprofile = "There is no profile for the user"
        return res.status(400).json(errors);
      }
      else {
        res.json(profile);
      }
    })
    .catch(err => res.status(404).json(err));
});

// make profiles
router.post('/', auth, (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const profileFields = {};
  profileFields.user = req.user.user._id;
  if(req.body.handle) profileFields.handle = req.body.handle;
  if(req.body.company) profileFields.company = req.body.company;
  if(req.body.website) profileFields.website = req.body.website;
  if(req.body.location) profileFields.location = req.body.location;
  if(req.body.bio) profileFields.bio = req.body.bio;
  if(req.body.status) profileFields.status = req.body.status;
  if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
  // Skills split into an array
  if(typeof req.body.skills !== 'undefined') {
    profileFields.skills = req.body.skills.split(',');
  }

  // social
  profileFields.social = {};
  if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

  Profile
  .findOne({ user: req.user.user._id })
  .then(profile => {
    if (profile) {
      // make updates
      Profile
        .findOneAndUpdate(
          { user: req.user.user._id },
          { $set: profileFields },
          { new: true }
        )
        .then(profile => res.json(profile));
    } else {
      // create
      Profile
        .findOne({ handle: profileFields.handle })
        .then(profile => {
          if(profile) {
            errors.handle = "The handle already exists"
            return res.status(400).json(errors);
          }
          // save
          new Profile(profileFields)
            .save()
            .then(profile => res.json(profile));
        });
    }
  });
});

export default router;
