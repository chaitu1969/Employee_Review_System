const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const dotEnv = require("dotenv");
dotEnv.config();
const app = express();
const db = require("./config/databse");
const path = require("path");
const { PORT, MONGODB_URL, SESSION_SECRET_KEY } = process.env;
const expressLayouts = require("express-ejs-layouts");

// Session cooke
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");

const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const customWare = require("./config/middleware");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressLayouts);
app.use(express.static("public"));
//Setting View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(
  session({
    name: "Employee review System",
    secret: "malware",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: new MongoStore(
      {
        mongoUrl:
          "mongodb+srv://chaitanya:Chaitu%401503@cluster0.3rf5cgk.mongodb.net/?retryWrites=true&w=majority",
        autoRemove: "disabled",
      },
      function (err) {
        console.log(err || "Connect-mongo setup done");
      }
    ),
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);
app.use(flash());
app.use(customWare.setFlash);

// use express router
app.use("/", require("./routes"));

app.listen(5000, (err) => {
  if (err) {
    console.log(`Error in running the server : ${5000}`);
  }
  console.log(`Server is running on port : ${5000}`);
});

//Feedback
// app.get("/post", (req, res) => {
//   res.render("feedback");
// });

// app.post("/submit-feedback", (req, res) => {
//   const feedback = req.body.feedback;
//   console.log("Received feedback:", feedback);
//   res.redirect("/");
// });
