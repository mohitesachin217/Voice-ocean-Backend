const express = require("express");
const session = require('express-session'); // 🔧
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const Routes = require("./routes/routes");
const connection = require("./db.js");
const bodyParser = require('body-parser');

const port = process.env.PORT || 3003;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// 🔧 Add session middleware BEFORE anything that uses req.session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// 🔧 Now require and use auth middleware
// const auth = require('./middleware/auth');

// app.use((req, res, next) => {
//   // Allow unauthenticated access to login/logout
//   const openRoutes = ['/login', '/logout'];
//   if (openRoutes.includes(req.path)) {
//     return next();
//   }
//   return auth(req, res, next);
// });

// Load SSL Certificates (Replace with real certs in production)
const options = {
  key: fs.readFileSync("key.pem"),    // SSL private key
  cert: fs.readFileSync("cert.pem"),  // SSL certificate
  ca: fs.readFileSync('my_cert.crt')  // Trusted CA
};

app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, "dist")));
app.use("/voice_samples", express.static("voice_samples"));
app.use("/client_images", express.static("client_images"));

// Middleware to log requests
app.use((req, res, next) => {
  req.requestTime = new Date().toTimeString();
  console.log(req.headers);
  next();
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

app.get("/", (req, res) => res.status(200).json("success"));
app.get("/server", (req, res) => res.send("server is running"));
app.use("/", Routes);

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Database Connection
connection.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("Database connection successful");

    // Start HTTPS Server
    https.createServer(options, app).listen(port, () => {
      console.log(`HTTPS Server listening on port ${port}`);
    });
  }
});
