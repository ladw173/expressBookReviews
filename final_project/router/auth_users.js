const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });

  return userswithsamename.length > 0
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  return validusers.length > 0
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const username = req.session.username;
  const isbn = req.params.isbn;
  const userReview = req.body.review;
  if (!books[isbn]) {
    return res.status(300).json({message: "Book not existed!"});
  }
  if (!userReview || userReview.length == 0) {
    return res.status(300).json({message: "Invalid review!"});
  }
  books[isbn].reviews[username] = userReview
  return res.status(200).send("Book review updated!");
});

// delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const username = req.session.username;
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(300).json({message: "Book not existed!"});
  }
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username]
    return res.status(200).send("Book review deleted!");
  } else {
    return res.status(300).json({message: "Your review not found!"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
