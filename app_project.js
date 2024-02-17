const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = require('/Users/kevinghobrial/Desktop/app.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://kevinghobrial:<password>@cluster0.1jcxqor.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  schedule: { type: String }, // Modify this schema based on your requirements
  hobbies: { type: String },
});

// Create a User model
const User = mongoose.desktop('User', userSchema);

app.use(require('express-session')({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(express.json()); // Parse JSON requests
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Your routes for authentication (signup, login, logout) would go here

// Sample code for handling schedule input
app.post('/api/schedule', async (req, res) => {
  try {
    const userId = req.user._id;
    const scheduleData = req.body.schedule;

    // Update the user's schedule in MongoDB
    const user = await User.findByIdAndUpdate(userId, { schedule: scheduleData }, { new: true });

    res.status(200).json({ message: 'Schedule updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Sample code for handling hobby input
app.post('/api/hobbies', async (req, res) => {
  try {
    const userId = req.user._id;
    const hobbiesData = req.body.hobbies;

    // Update the user's hobbies in MongoDB
    const user = await User.findByIdAndUpdate(userId, { hobbies: hobbiesData }, { new: true });

    res.status(200).json({ message: 'Hobbies updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Similar routes can be created for food times, AI optimization, and achievements

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
