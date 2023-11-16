const { urlsForUser, generateRandomString } = require('../helpers');

module.exports = function(app, urlDatabase, users) {


  // Route to show all URLs for a logged-in user
  app.get("/urls", (req, res) => {
    const userID = req.session.user_id;
    if (!userID) {
      res.redirect("/login");
    } else {
      const userUrls = urlsForUser(userID,urlDatabase);
      const templateVars = { urls: userUrls, user: users[userID] };
      res.render("urls_index", templateVars);
    }
  });

  // Route to display form to create a new URL, redirect to login if not authenticated
  app.get("/urls/new", (req, res) => {
    const userID = req.session.user_id;
    if (!userID) {
      res.redirect("/login");
    } else {
      res.render("urls_new", { user: users[userID] });
    }
  });


  // Route to handle new URL creation
  app.post("/urls", (req, res) => {
    const userID = req.session.user_id;
    if (!userID) {
      return res.status(401).send("You must be logged in to create URLs.");
    }

    const longURL = req.body.longURL; // Get the long URL from the form submission
    const shortURL = generateRandomString(); // Generate a random short URL ID
    urlDatabase[shortURL] = { longURL: longURL, userID: userID }; // Add the new URL to the database

    res.redirect(`/urls/${shortURL}`); // Redirect to the new URL's page
  });

  // Route to show a single URL and its short form, provided the user owns the URL
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
};