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


app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// Start server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
