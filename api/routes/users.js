// imports
import express from "express";
import gravatar from "gravatar";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";

// local imports
import User from "../models/User";
import auth from "../middleware/auth";
import { validateLoginInput, validateSignupInput } from "../validation/auth";

const router = express.Router();

router.post('/signup', (req, res) => {
  const { errors, isValid } = validateSignupInput(req.body.addUser);
  // validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User
  .findOne({ email: req.body.addUser.email })
  .then(user => {
    if (user) {
      errors.email = "Such email already exists"
      return res.status(409).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      const newUser = new User({
        name: req.body.addUser.name,
        email: req.body.addUser.email,
        avatar,
        password: req.body.addUser.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.status(201).json({
              status: "201",
              message: "You have successfully signed up, welcome...",
              user: {
                confirmed: user.confirmed,
                _id: user._id,
                name: user.name,
                email: user.email
              }
            }))
            .catch(err => res.json(err.message));
        });
      });
    }
  });
});

router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body.credentials);
  if(!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.credentials.email;
  const password = req.body.credentials.password;
  User
    .findOne({email})
    .then(user => {
      if (!user) {
        errors.global = "The credentials does not match please confirm email and password"
        return res.status(400).json(errors)
      }
      // check password
      bcrypt
        .compare(password, user.password)
        .then(isMatch => {
          if(isMatch) {
            const payload = { user }

            jwt.sign(payload,
              process.env.SECRET_KEY,
              { expiresIn: 3600 },
              (err, token) => {
              return res
                .json({
                  status: "200",
                  message: "You have logged in as " + user.email,
                  user: {
                    email: user.email,
                    token: token,
                    name: user.name,
                    avatar: user.avatar
                  },
                  token: 'Bearer ' + token
                });
            });
          } else {
            errors.global = "Invalid credentials"
            return res.status(401).json(errors)
          }
        })
    })
    .catch(err => console.log(err));
});

router.get('/current', auth, (req, res) => {
  User
    .findOne({ _id: req.user.user._id })
    .then(user => res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email
    }))
    .catch(err => res.status(400).json(err))
});

export default router;
