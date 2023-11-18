module.exports = function(app, users, bcrypt) {

  const { getUserByEmail, generateRandomString, } = require('../helpers');

  // Root route redirects based on authentication
  app.get("/", (req, res) => {
    if (req.session.user_id) {
      res.redirect("/urls");
    } else {
      res.redirect("/login");
    }
  });
  
  // Login route
  app.get("/login", (req, res) => {
    const userID = req.session.user_id;
    if (userID) {
      res.redirect("/urls");
    } else {
      res.render("login");
    }
  });

  // Login form submission
  app.post("/login", (req, res) => {
    console.log("Login route hit. Email:", req.body.email);
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

  // Logout action
  app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect('/login');
  });

  // Register route
  app.get("/register", (req, res) => {
    const userID = req.session.user_id;
    if (userID) {
      res.redirect("/urls");
    } else {
      res.render("register");
    }
  });

  //Registration form submission
  app.post("/register", (req, res) => {
    console.log("Register route hit. Email:", req.body.email);
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
};
