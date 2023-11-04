
const getUserByEmail = require('./helpers'); 

const express = require("express"); // line 1
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');


const app = express();
const PORT = 8080;

const users = {};

app.set("view engine", "ejs");


app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'], // Replace these with your own secret keys
  // Cookie options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(express.urlencoded({ extended: true }));



const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" }
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
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

const urlsForUser = (id) => {
  let filteredUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      filteredUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredUrls;
};

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  if (!userID) {
    return res.status(401).send("Please log in to view this URL.");
  }
  if (!url || url.userID !== userID) {
    return res.status(403).send("You do not have permission to view this URL.");
  }
  const templateVars = { id: shortURL, longURL: url.longURL, user: users[userID] };
  res.render("urls_show", templateVars);
});


// Redirect to login if not logged in when accessing /urls/new
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login");
  }
  res.render("urls_new");
});

// Other GET routes...

// Redirect to /urls if logged in when accessing /login
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect("/urls");
  }
  res.render("login");
});

// Redirect to /urls if logged in when accessing /register
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect("/urls");
  }
  res.render("register");
});

// Other POST routes...

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  } else {
    res.status(403).send("Email or password is incorrect.");
  }
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post("/register", (req, res) => { //// ?? here ?
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send("Email already in use.");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userID = generateRandomString();

  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword
  };

  req.session.user_id = userID;
  res.redirect('/urls');
});


// Line 135-146: POST route to delete a URL
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

// Line 148-160: POST route to update a URL
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



// Other POST routes...

app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});
