// imports
import express from "express";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

// local imports
import users from './routes/users';
import profiles from './routes/profiles';
import posts from './routes/posts';

dotenv.config();
const app = express();

// connect to database
mongoose
  .connect(process.env.DB_URL, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// register endpoints
app.use('/api/users', users)
// app.use('/api/profiles', profiles)
// app.use('/api/posts', posts)

const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Server running on port ${port}`));
