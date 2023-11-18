const express = require("express");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { requireLogin } = require('./middleware');

const app = express();
const PORT = 8080; // Default port 8080



const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

// Users database example
const users = {};

// URL database example
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" }
};

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'], // Replace these with your own secret keys
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(express.urlencoded({ extended: true }));

// Require and initialize authRoutes here
const authRoutes = require('./routes/auth');
authRoutes(app, users, bcrypt);

const urlRoutes = require('./routes/urls');
urlRoutes(app, urlDatabase, users);

// Start the server
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
