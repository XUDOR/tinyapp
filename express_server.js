const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Set EJS as the view engine
app.set("view engine", "ejs");

// Sample database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//  Random Url generation function
const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};
console.log(generateRandomString());


// Root route

app.use(express.urlencoded({ extended: true })); /// this goes here ??

app.get("/", (req, res) => {
  res.send("Hello!");
});

// Send database as JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Render the urls_index template
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Add the new route definition for '/urls/new' here
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Render information about a single URL
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

// Render the hello_world template (you can remove this if it's not needed)
app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;                    // Extract the short URL ID from the request
  const longURL = urlDatabase[shortURL];             // Look up the long URL using the short URL ID
  if (!longURL) {                                    // If the short URL ID doesn't exist in the database
    return res.status(404).send("URL not found");    // Send a 404 not found response
  }
  res.redirect(longURL);                             // Redirect to the long URL
});



app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});


// Start server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
