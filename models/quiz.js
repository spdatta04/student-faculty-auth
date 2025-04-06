const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String,
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
});

module.exports = mongoose.model("Quiz", QuizSchema);
