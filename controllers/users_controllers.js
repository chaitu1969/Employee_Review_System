const Review = require("../models/review");
const User = require("../models/user");

// Rendering Sign-In page
module.exports.signIn = (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.role === "admin") {
      return res.redirect("/admin-dashboard");
    }
    return res.redirect(`employee-dashboard/${req.user.id}`);
  }
  return res.render("user_sign_in", {
    title: "Review system | signIn",
  });
};

//Rendering Sign-Up Page
module.exports.signUp = (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.role === "admin") {
      return res.redirect("/admin-dashboard");
    }
    return res.redirect(`employee-dashboard/${req.user.id}`);
  }
  return res.render("user_sign_up", {
    title: "Review system | signUp",
  });
};

// Render add sign up page
module.exports.addEmployee = (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.role === "admin") {
      return res.render("add_employee", {
        title: "Add Employee",
      });
    }
  }
  return res.redirect("/");
};

// render edit employee page
module.exports.editEmployee = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      if (req.user.role === "admin") {
        const employee = await User.findById(req.params.id).populate({
          path: "reviewsFromOthers",
          populate: {
            path: "reviewer",
            model: "User",
          },
        });

        const reviewsFromOthers = employee.reviewsFromOthers;

        return res.render("edit_employee", {
          title: "Edit Employee",
          employee,
          reviewsFromOthers,
        });
      }
    }
    return res.render("/");
  } catch (err) {
    console.log("error", err);
    return res.redirect("back");
  }
};

// SignUp Page
module.exports.create = async (req, res) => {
  try {
    const { username, email, password, confirm_password, role } = req.body;

    // if password doesn't match
    if (password != confirm_password) {
      req.flash("error", "Password and Confirm password are not same");
      return res.redirect("back");
    }

    // check if user already exist
    const user = await User.findOne({ email });
    // if (err) {
    //   console.log("Error in finding user in signing up");
    //   return;
    // }

    // if user not found in db create one
    // if (!user) {
    //   await User.create(
    //     {
    //       email,
    //       password,
    //       username,
    //       role,
    //     },
    //     (err, user) => {
    //       if (err) {
    //         req.flash("error", "Couldn't sign Up");
    //       }
    //       req.flash("success", "Account created!");
    //       return res.redirect("back");
    //     }
    //   );
    // } else {
    //   req.flash("error", "User already registed!");
    //   return res.redirect("back");
    // }
    if (!user) {
      const newUser = await User.create({
        email,
        password,
        username,
        role,
      });
      req.flash("success", "Employee has been added");
      return res.redirect("back");
    } else {
      req.flash("error", "Employee already exist");
      return res.redirect("back");
    }
  } catch (err) {
    console.log("error", err);
    return res.redirect("back");
  }
};

// Add a Employee
module.exports.createEmployee = async (req, res) => {
  try {
    const { username, email, password, confirm_password } = req.body;

    if (password != confirm_password) {
      req.flash("error", `Password doesn't match Please check it !`);
      return res.redirect("back");
    }

    const user = await User.findOne({ email });

    if (!user) {
      User.create(
        {
          email,
          password,
          username,
        },
        (err, user) => {
          if (err) {
            req.flash("error", "Not able to add employee");
          }
          req.flash("sucess", "Employee addedd!");
          return res.redirect("back");
        }
      );
    } else {
      req.flash("error", "Employee already exist");
      return res.redirect("back");
    }
  } catch (err) {
    if (err) {
      console.log("Error", err);
      return res.redirect("back");
    }
  }
};

// Update employee details
module.exports.updateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    const { username, role } = req.body;
    if (!employee) {
      req.flash("error", "Employee doesn't exist");
      return res.redirect("back");
    }

    // update data from req.body
    employee.username = username;
    employee.role = role;
    employee.save();
    req.flash("success", "Employee details updated");
    return res.redirect("back");
  } catch (err) {
    console.log("Error", err);
    return res.redirect("back");
  }
};

// Delete a user form DB
module.exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    // delete all the rewiew in which the user is a receipent
    await Review.deleteMany({ recipient: id });

    // delete all the review in which the user is a reviewer
    await Review.deleteMany({ reviewer: id });

    // delete this user
    await User.findByIdAndDelete(id);

    req.flash("success", `${user} and associates has been deleted`);
    return res.redirect("back");
  } catch (err) {
    console.log("Error", err);
    return res.redirect("back");
  }
};

//Sign in and create a session for the user
module.exports.createSession = (req, res) => {
  req.flash("success", "Logged in Successfully");
  if (req.user.role === "admin") {
    return res.redirect("/admin-dashboard");
  }

  return res.redirect(`/employee-dashboard/${req.user.id}`);
};

//Destroy session
module.exports.destroySession = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully");
    return res.redirect("/");
  });
};
