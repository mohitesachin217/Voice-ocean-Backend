// routes/auth.js
const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/login', (req, res) => {
  const loginPagePath = path.resolve(__dirname, '../views/login.html');
  res.sendFile(loginPagePath);
});



// Handle login POST
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Add your real authentication logic here
  if (email === 'admin@example.com' && password === '123456') {
    req.session.user = { email }; // Store user in session
        return res.redirect('/');
  } else {
    res.send('Invalid credentials.');
  }
});

module.exports = router;
