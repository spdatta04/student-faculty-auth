const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  college: String,
  branch: String,
  regNo: String,
  password: String,
});

module.exports = mongoose.model("Student", studentSchema);
