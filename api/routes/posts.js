import express from "express";

// local imports
import auth from "../middleware/auth";
import validateTextInput from "../validation/post";
import Profile from "../models/Profile";
import Post from "../models/Post";

const router = express.Router();

// create a Post
// private
router.post('/', auth, (req, res) => {
  const { errors, isValid } = validateTextInput(req.body.addPost);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const newPost = new Post({
    text: req.body.addPost.text,
    name: req.body.addPost.name,
    avatar: req.body.addPost.avatar,
    user: req.user.user._id
  });

  newPost
  .save()
  .then(post => res.status(201).json(post))
  .catch(err => res.json(err));
});

// get all posts
// public
router.get('/all', (req, res) => {
  const errors = {};

  Post
    .find()
    .populate('user', ['name', 'avatar'])
    .sort({ createdAt: -1 })
    .then(posts => {
      if (posts.length == 0) {
        errors.nopost = "There are no posts yet"
        return res.status(404).json(errors);
      } else {
        return res.status(200).json(posts);
      }
    })
    .catch(err => res.json(err));
})

// get post by id
// public
router.get('/:post_id', (req, res) => {
  const errors = {};

  Post
    .findOne({ _id: req.params.post_id })
    .then(post => {
      if (!post) {
        errors.nopost = "The post you are requesting cannot be found"
        return res.status(404).json(errors);
      } else {
        return res.status(200).json(post);
      }
    })
    .catch(err => res.status(404).json({
      nopost: "The post you are requesting cannot be found"
    }));
});

// delete a post (only the owner can delete)
// private
router.delete('/:post_id', auth, (req, res) => {
  const errors = {};

  Profile
    .findOne({ user: req.user.user._id })
    .then(profile => {
      if (!profile) {
        errors.noprofile = "Set your profile to proceed in this app"
        return res.status(404).json(errors);
      }

      Post
        .findOne({ _id: req.params.post_id })
        .then(post => {
          if (!post) {
            errors.nopost = "Either the post is deleted or does not exist"
            res.status(404).json(errors);
          }
          if (post.user.toString() !== req.user.user._id) {
            errors.notauthorized = "You are not authorized"
            return res.status(401).json(errors);
          }
          post
            .remove()
            .then(() => {
              return res.status(200).json({
                post: "The post has been deleted"
              });
            })
            .catch(err => res.json(err));
        })
        .catch(err => res.status(404).json({
          nopost: "Either the post is deleted or does not exist"
        }));
    })
    .catch(err => res.json(err));
  });


// like a post
// private
router.post('/like/:post_id', auth, (req, res) => {
  const errors = {};

  Profile
    .findOne({ user: req.user.user._id })
    .then(profile => {
      if (!profile) {
        errors.noprofile = "Set profile to proceed with this app"
        res.status(404).json(errors);
      }
      // find post
      Post
        .findOne({ _id: req.params.post_id })
        .then(post => {
          if (!post) {
            erros.nopost = "error liking, the post does not exist"
            return res.status(404).json(erros);
          }
          if (post.likes.filter(like => like.user.toString() === req.user.user._id).length > 0) {
            return res.status(409).json({ alreadyliked: "You have already liked" })
          }
          post
            .likes
            .unshift({ user: req.user.user._id });
          post
            .save()
            .then(post => {
              return res.status(201).json({
                liked: "Post liked",
                post: post
              })
            })
            .catch(err => res.json(err));
        })
        .catch(err => res.status(404).json({ nopost: "error liking, the post does not exist" }));
    })
    .catch(err => res.json(err));
});

// unlike a post
// private
router.post('/unlike/:post_id', auth, (req, res) => {
  const errors = {};

  Profile
    .findOne({ user: req.user.user._id })
    .then(profile => {
      if (!profile) {
        errors.noprofile = "Set profile to proceed with this app"
        return res.status(404).json(errors);
      }
      // find post
      Post
        .findOne({ _id: req.params.post_id })
        .then(post => {
          if (!post) {
            errors.nopost = "error unliking, the post does not exist"
            return res.status(404).json(errors)
          }
          if (post.likes.filter(like => like.user.toString() === req.user.user._id).length === 0) {
            return res.status(404).json({ nolike: "You have not yet liked the post" })
          }

          // remove index
          const removeIndex = post
            .likes
            .map(item => item.user.toString())
            .indexOf(req.user.user._id)

          //delete
          post
            .likes
            .splice(removeIndex, 1);

          //save
          post
            .save()
            .then(post => {
              res.json({
                unlike: "You have unliked post",
                post: post
              })
            })
            .catch(err => res.json(err));

        })
        .catch(err => res.status(404).json({ nopost: "The post by that does not exist" }));
    })
    .catch(err => res.json(err));
});

// comment on a post
// private
router.post('/comments/:post_id', auth, (req,res) => {
  const { errors, isValid } = validateTextInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  Profile
    .findOne({ user: req.user.user._id })
    .then(profile => {
      if (!profile) {
        errors.noprofile = "Set profile to proceed with this app"
        return res.status(404).json(errors)
      }
      // find post
      Post
        .findOne({ _id: req.params.post_id })
        .then(post => {
          if (!post) {
            errors.nopost = "error on commenting, the post does not exist"
            return res.status(404).json(errors);
          }
          // add comment
          const newComment = {
            user: req.user.user._id,
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar
          }
          post
            .comments
            .unshift(newComment);
          post
            .save()
            .then(post => {
              return res.status(201).json({
                comment: "Post commented",
                post: post
              })
            })
            .catch(err => res.json(err));
        })
        .catch(err => res.status(404).json({ nopost: "error on commenting, the post does not exist" }));
    })
    .catch(err => res.json(err));
});

// delete a comment
// private
router.delete('/comments/:post_id/:comment_id', auth, (req, res) => {
  const errors = {};

  Profile
    .findOne({ user: req.user.user._id })
    .then(profile => {
      if (!profile) {
        errors.noprofile = "Set profile to proceed with this app"
        return  res.status(404).json(errors);
      }

    Post
      .findOne({ _id: req.params.post_id })
      .then(post => {
        if (!post) {
          errors.nopost = "Either the post is deleted or does not exist"
        }

        if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length  === 0) {
          return res.json({ nocomment: "Either the comment was deleted or does not exist" })
        }

        // continue if exists
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id)
        post
          .comments
          .splice(removeIndex, 1)
        post
          .save()
          .then(post => {
            res.json({
              comment: "The comment was successfully deleted",
              post: post
            })
          })
          .catch(err => res.json(err));
      })
      .catch(err => res.status(404).json({ nopost: "The post by that id does not exist" }));
    })
    .catch(err => res.json(err));
});


export default router;
