const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

// Authentication using passport
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async function (req, email, password, done) {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          req.flash("error", "Invalid username and password");
          return done(null, false);
        }

        const isPasswordCorrect = await user.isValidatedPassword(password);

        if (!isPasswordCorrect) {
          req.flash("error", "Invalid username and password");
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        req.flash("error", err);
        return done(err);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// Deserializing the user from the key it the cookies
// passport.deserializeUser(function (id, done) {
//   try {
//     const user = User.findById(id);
//     if (!user) {
//       req.flash("error", "Employee doesnt exist");
//       return res.redirect("back");
//     } else {
//       return done(null, user);
//     }
//   } catch (err) {
//     console.log(err);
//     return res.redirect("back");
//   }
//   // User.findById(id, function (err, user) {
//   //   if (err) {
//   //     console.log("Error in finding user ---> Passport");
//   //     return done(err);
//   //   }

//   //   return done(null, user);
//   // });
// });

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

// Check if user authenticated (middleware)
passport.checkAuthentication = function (req, res, next) {
  // if the user is signed in, then pass on the request to the next function(controller's action)
  console.log("inside check authentication: ", req);
  if (req.isAuthenticated()) {
    return next();
  }

  // if the user is not signed in
  return res.redirect("/");
};

passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    // req.user contains the current signed in user from the session cookie and we are just sending this to the locals for the views
    res.locals.user = req.user;
  }
  next();
};

module.exports = passport;
