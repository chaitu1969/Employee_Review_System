const User = require("../models/user");
const Review = require("../models/review");

// Assign a review task

module.exports.assignReview = async (req, res) => {
  const { recipient_email } = req.body;

  try {
    if (req.isAuthenticated()) {
      const reviewer = await User.findById(req.params.id);
      const recipient = await User.findOne({ email: recipient_email });

      // checking if review already assigned
      const alreadyAssigned = reviewer.assignedReviews.filter(
        (userId) => userId == recipient.id
      );

      // if found, prevent from assigning another review for same person
      if (alreadyAssigned > 0) {
        req.flash("error", "Review already assigned");
        return res.redirect("back");
      }

      // update reviews assignedReview field by placing reference of receipent
      await reviewer.updateOne({
        $push: { assignedReviews: recipient },
      });

      req.flash("success", "review assigned successfully");
      return res.redirect("back");
    } else {
      req.flash("error", `couldn't assign the review`);
    }
  } catch (err) {
    console.log(err);
  }
};

// Submitting the review
module.exports.submitReview = async (req, res) => {
  const { recipient_email, feedback } = req.body;
  try {
    const recipient = await User.findOne({ email: recipient_email });
    const reviewer = await User.findById(req.params.id);

    // creating a new review
    const review = await Review.create({
      review: feedback,
      reviewer,
      recipient,
    });

    // remove all extra spaces from the feedback/review
    const reviewString = review.review.trim();

    // prevent from submitting empty feedback
    if (reviewString === "") {
      req.flash("error", `Please provide the feedback!`);
      return res.redirect("back");
    }

    // put reference of newly created review to receipent schema Or updating the review schema in the database
    await reviewer.updateOne({
      $push: { reviewsFromOthers: review },
    });

    // removing the reference of the receipent from the reviews assignedReview field
    await reviewer.updateOne({
      $pull: { assignedReviews: recipient.id },
    });
    req.flash("success", "review submitted successfully");
    return res.redirect("back");
  } catch (err) {
    console.log(err);
  }
};

// Updating the review
module.exports.updateReview = async (req, res) => {
  try {
    const { feedback } = req.body;
    const reviewTobUpdated = await Review.findById(req.params.id);

    // if review not found on Review Schema
    if (!reviewTobUpdated) {
      req.flash("error", "Review does not exist ");
    }

    reviewTobUpdated.review = feedback;
    reviewTobUpdated.save();
    req.flash("success", "Review updated");
    return res.redirect("back");
  } catch (err) {
    console.log(err);
  }
};
