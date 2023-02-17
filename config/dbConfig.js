const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
const connectWithDB = (uri) => {
  return mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("MongoDB Connected...!");
    })
    .catch((err) => {
      console.log("DB Connection Failed...!");
      console.log(err);
      process.exit(1);
    });
};

module.exports = connectWithDB;
