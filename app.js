// app.js

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./models/user');
const flash = require('connect-flash');
const Calendar = require('@toast-ui/calendar');
require('@toast-ui/calendar/dist/toastui-calendar.min.css');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(flash());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.set('view engine', 'ejs');
app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Routes for authentication
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.error('Username and password are required.');
    return res.render('signup');
  }

  const newUser = new User({ username, password });

  User.register(newUser, password, (err, user) => {
    if (err) {
      console.error(err);
      return res.render('signup');
    }

    passport.authenticate('local')(req, res, () => {
      res.redirect('/dashboard');
    });
  });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true,
}), (req, res) => {
  console.log('Login route reached');
});

// Routes for the calendar
app.get('/api/calendar', isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.calendarEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/calendar', isLoggedIn, async (req, res) => {
  const { title, start, end } = req.body;

  try {
    const user = await User.findById(req.user.id);

    user.calendarEvents.push({ title, start, end });
    await user.save();

    res.json(user.calendarEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Other routes for updating and deleting events can be added as needed

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }
    res.redirect('/login');
  });
});

app.get('/dashboard', isLoggedIn, (req, res) => {
  console.log('Reached the dashboard route');
  res.render('dashboard', { user: req.user });
});

app.get('/schedule', isLoggedIn, (req, res) => {
  res.render('schedule', { user: req.user });
});

// Sample code for retrieving schedule
app.get('/api/schedule', isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;

    // Retrieve the user's schedule from MongoDB
    const user = await User.findById(userId);
    if (!user) {
      req.flash('errorMessage', 'User not found.');
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ schedule: user.schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Sample code for updating the schedule
app.post('/api/schedule', isLoggedIn, async (req, res) => {
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

// Only one app.listen statement is needed at the end of your file
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
