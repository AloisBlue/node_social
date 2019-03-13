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
  const { errors, isValid } = validateSignupInput(req.body);
  // validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User
  .findOne({ email: req.body.email })
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
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => res.json(err.message));
        });
      });
    }
  });
});

router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if(!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;
  User
    .findOne({email})
    .then(user => {
      if (!user) {
        errors.email = "The credentials does not match please confirm email and password"
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
                  token: 'Bearer ' + token
                });
            });
          } else {
            errors.password = "Invalid credentials"
            return res.status(401).json(errors)
          }
        })
    })
    .catch(err => console.log(err));
});

export default router;
