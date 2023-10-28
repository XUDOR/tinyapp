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

// Root route
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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

