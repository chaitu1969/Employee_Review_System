const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://chaitanya:Chaitu%401503@cluster0.3rf5cgk.mongodb.net/?retryWrites=true&w=majority"
  // {
  //   useNewUrlParser: true,
  //   useUnifiedTopolgy: true,
  // }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error: "));
db.once("open", () => {
  console.log("Database Connection has been established");
});

module.exports = db;
