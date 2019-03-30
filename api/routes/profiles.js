import express from "express";

// local imports
import auth from "../middleware/auth";
import User from "../models/User";
import Profile from "../models/Profile";
import { validateProfileInput, validateExperienceInput, validateEducationInput } from "../validation/profile"

const router = express.Router();

// get profile with handle
// public
router.get('/handle/:handle', (req, res) => {
  const errors = {};

  Profile
    .findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "No profile found for this handle"
        return res.status(404).json(errors)
      } else {
        res.status(200).json(profile)
      }
    })
    .catch(err => res.status(400).json(err));
});

// get profile with user id
// public
router.get('/user/:user_id', (req, res) => {
  const errors = {};

  Profile
    .findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "No profile by this user id"
        return res.status(404).json(errors)
      } else {
        res.status(200).json(profile)
      }
    })
    .catch(err => {
      if (err) {
        errors.noprofile = "No profile by this user id"
        return res.status(404).json(errors)
      }
    });
});

// get all profiles
// public
router.get('/all', (req, res) => {
  const errors = {};

  Profile
    .find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (profiles.length == 0){
        errors.noprofile = "There are no profiles"
        return res.status(400).json(errors)
      } else {
        res.status(200).json(profiles)
      }
    })
    .catch(err => {
      if (err) {
        errors.noprofile = "There are no profiles"
        return res.status(404).json(errors)
      }
    });
});

// get your own profile
// private
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

// make a profile
// private
router.post('/', auth, (req, res) => {
  const { errors, isValid } = validateProfileInput(req.body.newProfile);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const profileFields = {};
  profileFields.user = req.user.user._id;
  if(req.body.newProfile.handle) profileFields.handle = req.body.newProfile.handle;
  if(req.body.newProfile.company) profileFields.company = req.body.newProfile.company;
  if(req.body.newProfile.website) profileFields.website = req.body.newProfile.website;
  if(req.body.newProfile.location) profileFields.location = req.body.newProfile.location;
  if(req.body.newProfile.bio) profileFields.bio = req.body.newProfile.bio;
  if(req.body.newProfile.status) profileFields.status = req.body.newProfile.status;
  if(req.body.newProfile.githubusername) profileFields.githubusername = req.body.newProfile.githubusername;
  // Skills split into an array
  if(typeof req.body.newProfile.skills !== 'undefined') {
    profileFields.skills = req.body.newProfile.skills.split(',');
  }

  // social
  profileFields.social = {};
  if(req.body.newProfile.youtube) profileFields.social.youtube = req.body.newProfile.youtube;
  if(req.body.newProfile.twitter) profileFields.social.twitter = req.body.newProfile.twitter;
  if(req.body.newProfile.facebook) profileFields.social.facebook = req.body.newProfile.facebook;
  if(req.body.newProfile.linkedin) profileFields.social.linkedin = req.body.newProfile.linkedin;
  if(req.body.newProfile.instagram) profileFields.social.instagram = req.body.newProfile.instagram;

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

// add experience
// private
router.post('/experience', auth, (req, res) => {
  const { errors, isValid } = validateExperienceInput(req.body.newExperience);

  if(!isValid) {
    return res.status(400).json(errors)
  }

  Profile
    .findOne({ user: req.user.user._id })
    .then(profile => {
      if (!profile) {
        errors.noprofile = "You must have a profile to add experience"
        return res.status(400).json(errors)
      }

      const newExp = {
        title: req.body.newExperience.title,
        company: req.body.newExperience.company,
        location: req.body.newExperience.location,
        from: req.body.newExperience.from,
        to: req.body.newExperience.to,
        current: req.body.newExperience.current,
        description: req.body.newExperience.description
      }

      // add experience to existing profile
      profile.experience.unshift(newExp);
      // save
      profile
        .save()
        .then(profile => res.status(200).json(profile))
        .catch(err => res.status(400).json(err));
    })
    .catch(err => res.status(400).json(err));
});

// add education
// private
router.post('/education', auth, (req, res) => {
  const { errors, isValid } = validateEducationInput(req.body.newEducation);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Profile
    .findOne({ user: req.user.user._id })
    .then(profile => {
      if(!profile) {
        errors.noprofile = "You must have a profile to add education background"
        return res.status(400).json(errors)
      }

      const newEdu = {
        school: req.body.newEducation.school,
        degree: req.body.newEducation.degree,
        fieldofstudy: req.body.newEducation.fieldofstudy,
        from: req.body.newEducation.from,
        to: req.body.newEducation.to,
        current: req.body.newEducation.current,
        description: req.body.newEducation.description
      }

      // add education to existing profile
      profile.education.unshift(newEdu);
      profile
      .save()
      .then(profile => res.status(200).json(profile))
      .catch(err => res.status(400).json(err));
    })
    .catch(err => res.status(400).json(err))
});

// delete experience
// private
router.delete('/experience/:exp_id', auth, (req, res) => {
  const errors = {};

  //check for profile
  Profile
    .findOne({ user: req.user.user._id })
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for the user"
        return res.status(404).json(errors);
      } else if (profile.experience.length == 0) {
        // return error if no experience by the provided id
        errors.noexperience = "Either there is no experience for that id or it's already deleted"
        return res.status(404).json(errors)
      } else {
        // make remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex, 1);
        profile
          .save()
          .then(profile => res.status(200).json(profile))
          .catch(err => res.status(400).json(err));
      }
    })
    .catch(err => res.status(404).json(err));
});

// delete education
// private
router.delete('/education/:edu_id', auth, (req, res) => {
  const errors = {};

  // check for the profile
  Profile
    .findOne({ user: req.user.user._id })
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for the user"
        return res.status(404).json(errors)
      } else if (profile.education.length == 0) {
        errors.noeducation = "Either there is no education background for that id or it's already deleted"
        return res.status(404).json(errors)
      } else {
        // make a remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);
        profile
          .save()
          .then(profile => res.status(200).json(profile))
          .catch(err => res.status(400).json(err));
      }
    })
    .catch(err => res.status(404).json(err));
});

// delete user account and profile
// private
router.delete('/', auth, (req, res) => {
  const errors = {};

  Profile
    .findOneAndRemove({ user: req.user.user._id })
    .then(() => {
      // check if user exist when deleting
      User
      .findOne({ _id: req.user.user._id })
      .then(user => {
        if (!user) {
          errors.user = "User already deleted"
          return res.status(400).json(errors)
        } else {
          // continue and delete user
          User
            .findOneAndRemove({ _id: req.user.user._id })
            .then(() => {
              res.json({ message: "User account successfully deleted" })
            })
            .catch(err => res.json(err));
        }
      })
      .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

export default router;
