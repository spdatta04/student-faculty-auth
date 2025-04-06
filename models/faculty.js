const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
  name: String,
  phone: String,
  subject: String,
  collegeName: String,
  facultyCode: Number, // ✅ Ensure facultyCode is included
  password: String,
});

module.exports = mongoose.model("Faculty", facultySchema);
