const { requireLogin } = require('../middleware');

module.exports = function(app, urlDatabase, users) {

  const { urlsForUser, generateRandomString } = require('../helpers');

  // Route to display JSON of all URLs (for debugging)
  app.get("/urls.json", requireLogin, (req, res) => {
    res.json(urlDatabase);
  });

  // Route to show all URLs for a logged-in user
  app.get("/urls", requireLogin, (req, res) => {
    const userID = req.session.user_id;
    const userUrls = urlsForUser(userID,urlDatabase);
    const templateVars = { urls: userUrls, user: users[userID] };
    res.render("urls_index", templateVars);
    
  });

  // Route to display form to create a new URL, redirect to login if not authenticated
  app.get("/urls/new", requireLogin, (req, res) => {
    const userID = req.session.user_id;
    res.render("urls_new", { user: users[userID] });
    
  });

  // Route to handle new URL creation
  app.post("/urls", requireLogin, (req, res) => {
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
  app.get("/urls/:id", requireLogin, (req, res) => {
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

  app.get("/u/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const urlEntry = urlDatabase[shortURL];

    if (urlEntry) {
      res.redirect(urlEntry.longURL);
    } else {
      res.status(404).send("Short URL not found");
    }
  });

  // URL deletion
  app.post("/urls/:id/delete", requireLogin, (req, res) => {
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
  app.post("/urls/:id", requireLogin, (req, res) => {
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
};

