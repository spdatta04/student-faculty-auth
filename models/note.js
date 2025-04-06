const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  fileName: String,
  filePath: String,
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
});

module.exports = mongoose.model("Note", NoteSchema);
