// This file is the 'main' file in the project. It connects everything together and runs the server.
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
app.use(session({
  secret: "RecipeSite!@#$%^&*()1234567890",
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,             // Set to true if we're using HTTPS (secure)
    maxAge: 24 * 60 * 60 * 1000, // 24 hours cookie expire date
    httpOnly: true             // Prevents client-side JavaScript from accessing the cookie (for security purposes)
  }
}));

// Parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add JSON body parser

// Serve other static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect 'requests' files
const loginReg = require('./requests/login-reg-req');
const foodApi = require('./requests/api-call');
const commentsReq = require('./requests/comment-req');
app.use(loginReg); // File to manage all requests associated with the login/registration page.
app.use(foodApi); // File to make api fetches from themealdb.com
app.use(commentsReq);

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, './public/html/login-reg.html'));
})
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, './public/html/login-reg.html'));
})
app.get('/recipe', (req, res) => {
  res.sendFile(path.join(__dirname, './public/html/recipe.html'));
})
app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, './public/html/search.html'));
})
/* app.get('/signup-complete', (req, res) => {
  res.sendFile(path.join(__dirname, './public/html/signup_complete.html'));
}) */
app.all('*', (req, res) => {
  res.send('Error 404 - PAGE NOT FOUND');
})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});