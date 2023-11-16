const express = require("express");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
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

// URL deletion
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;

  if (!userID) {
    return res.status(401).send("You must be logged in to delete URLs.");
  }

  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send("URL not found.");
  }

  if (url.userID !== userID) {
    return res.status(403).send("You do not have permission to delete this URL.");
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// URL update
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;

  if (!userID) {
    return res.status(401).send("You must be logged in to update URLs.");
  }

  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send("URL not found.");
  }

  if (url.userID !== userID) {
    return res.status(403).send("You do not have permission to update this URL.");
  }

  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect(`/urls/${shortURL}`);
});

const urlRoutes = require('./routes/urls');
urlRoutes(app, urlDatabase, users);


// Start the server
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
