const Review = require("../models/review");
const User = require("../models/user");

// Rendering Admin page/ dashbaord
module.exports.adminDashboard = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      if (req.user.role === "admin") {
        // getting all users from User model // populating all users for DB
        let users = await User.find({}).populate("username");

        // getting all filteed user mail id
        let filteredUsers = users.filter(
          (user) => user.email !== req.user.email
        );

        return res.render("admin_dashboard", {
          title: "Admin Page",
          users: filteredUsers,
        });
      } else {
        return res.redirect("back");
      }
    } else {
      return res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    return res.redirect("/");
  }
};

// Rendering employee Dashboard
module.exports.employeeDashboard = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const employee = await User.findById(req.params.id)
        .populate({
          path: "reviewsFromOthers",
          populate: {
            path: "reviewer",
            model: "User",
          },
        })
        .populate("assignedReviews");

      // extracting assigned review to the employee id
      const assignedReviews = employee.assignedReviews;
      // extractng feedback from the emploee id
      const reviewsFromOthers = employee.reviewsFromOthers;
      // populated reviews give from the others
      const populateResults = await Review.find().populate({
        path: "reviewer",
        model: "User",
      });

      return res.render("employee_dashboard", {
        title: "Employee Page",
        employee,
        assignedReviews,
        reviewsFromOthers,
      });
    } else {
      return res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    return res.redirect("back");
  }
};
