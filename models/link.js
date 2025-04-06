const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema({
  url: String,
  type: String,
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
});

module.exports = mongoose.model("Link", LinkSchema);
