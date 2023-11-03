const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

const users = {};

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const getUserByEmail = function(email, users) {
  for (let userID in users) {
    if (users[userID].email === email) {
      return users[userID];
    }
  }
  return null;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    const templateVars = { id: shortURL, longURL: longURL };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Short URL not found");
  }
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (!longURL) {
    return res.status(404).send("URL not found");
  }
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  res.render("login");
});


app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  let userID;
  for (let id in users) {
    if (users[id].email === email && users[id].password === password) {
      userID = id;
      break;
    }
  }

  if (userID) {
    res.cookie('user_id', userID);
    res.redirect('/urls');
  } else {
    res.status(403).send("Invalid email or password");
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Check if email or password are empty strings
  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  // Use the helper function to check if the email is already in use
  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send("Email already in use.");
  }

  // If the checks pass, proceed to create a new user
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: email,
    password: password // In a real application, this password should be hashed
  };

  res.cookie('user_id', userID);
  res.redirect('/urls');
});


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(404).send("Short URL not found");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
