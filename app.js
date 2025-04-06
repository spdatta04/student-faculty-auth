const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const multer = require("multer");

const Student = require("./models/student");
const Faculty = require("./models/faculty");
const Note = require("./models/note");
const Link = require("./models/link");
const Quiz = require("./models/quiz");

const app = express();

// ✅ Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/studentFacultyAuth", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// ✅ Session Setup
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// ✅ File Upload (PDFs)
const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Render Home Page
app.get("/", (req, res) => {
  res.render("index");
});

// ---------------- Faculty Part (UNCHANGED) ----------------

// ✅ Faculty Registration
app.get("/faculty-register", (req, res) => {
  res.render("faculty-register");
});

app.post("/faculty/register", async (req, res) => {
  const { name, phone, subject, collegeName, password } = req.body;
  const facultyCode = Math.floor(100 + Math.random() * 900);

  await new Faculty({ name, phone, subject, collegeName, facultyCode, password }).save();
  res.send(`✅ Registration Successful! Your Faculty Code: ${facultyCode}. Use this to log in.`);
});

// ✅ Faculty Login
app.get("/faculty-login", (req, res) => {
  res.render("faculty-login");
});

app.post("/faculty/login", async (req, res) => {
  const faculty = await Faculty.findOne({ facultyCode: req.body.facultyCode });

  if (faculty && faculty.password === req.body.password) {
    req.session.faculty = faculty;
    return res.redirect("/faculty/dashboard");
  }

  res.send("❌ Invalid Faculty Code or Password!");
});

// ✅ Faculty Dashboard (Now shows only faculty's own uploads)
app.get("/faculty/dashboard", async (req, res) => {
  if (!req.session.faculty) return res.redirect("/faculty-login");

  const facultyId = req.session.faculty._id;

  const notes = await Note.find({ facultyId });
  const youtubeLinks = await Link.find({ facultyId, type: "youtube" });
  const githubLinks = await Link.find({ facultyId, type: "github" });
  const quizzes = await Quiz.find({ facultyId });

  res.render("faculty-dashboard", {
    faculty: req.session.faculty,
    notes,
    youtubeLinks,
    githubLinks,
    quizzes,
  });
});

// ✅ Add YouTube Link
app.post("/faculty/add-youtube", async (req, res) => {
  if (!req.session.faculty) return res.redirect("/faculty-login");

  const { url } = req.body;
  await new Link({ url, type: "youtube", facultyId: req.session.faculty._id }).save();
  res.redirect("/faculty/dashboard");
});

// ✅ Add GitHub Link
app.post("/faculty/add-github", async (req, res) => {
  if (!req.session.faculty) return res.redirect("/faculty-login");

  const { url } = req.body;
  await new Link({ url, type: "github", facultyId: req.session.faculty._id }).save();
  res.redirect("/faculty/dashboard");
});

// ✅ Upload Notes (PDF)
app.post("/faculty/upload-note", upload.single("pdf"), async (req, res) => {
  if (!req.session.faculty) return res.redirect("/faculty-login");

  if (!req.file) return res.status(400).send("❌ No file uploaded.");

  await new Note({
    fileName: req.file.originalname,
    filePath: "/uploads/" + req.file.filename,
    facultyId: req.session.faculty._id,
  }).save();
  
  res.redirect("/faculty/dashboard");
});

// ✅ Add Quiz
app.post("/faculty/add-quiz", async (req, res) => {
  if (!req.session.faculty) return res.redirect("/faculty-login");

  const { question, options, correctAnswer } = req.body;
  const optionsArray = options.split(",").map((opt) => opt.trim());

  await new Quiz({ question, options: optionsArray, correctAnswer, facultyId: req.session.faculty._id }).save();
  res.redirect("/faculty/dashboard");
});

// ✅ Delete Quiz
app.post("/faculty/delete-quiz/:id", async (req, res) => {
  if (!req.session.faculty) return res.redirect("/faculty-login");

  await Quiz.findByIdAndDelete(req.params.id);
  res.redirect("/faculty/dashboard");
});

// ---------------- Student Part (UPDATED) ----------------

// ✅ Student Registration
app.get("/student-register", (req, res) => {
  res.render("student-register");
});

app.post("/student/register", async (req, res) => {
  const { name, college, branch, regNo, password } = req.body;
  await new Student({ name, college, branch, regNo, password }).save();
  res.redirect("/student-login");
});

// ✅ Student Login (Now redirects to faculty selection)
app.get("/student-login", (req, res) => {
  res.render("student-login");
});

app.post("/student/login", async (req, res) => {
  const student = await Student.findOne({ regNo: req.body.regNo });

  if (student && student.password === req.body.password) {
    req.session.student = student;
    return res.redirect("/student/select-faculty");
  }

  res.send("❌ Invalid Credentials!");
});

// ✅ Student Faculty Selection
app.get("/student/select-faculty", (req, res) => {
  if (!req.session.student) return res.redirect("/student-login");
  res.render("select-faculty");
});

app.post("/student/select-faculty", async (req, res) => {
  if (!req.session.student) return res.redirect("/student-login");

  const faculty = await Faculty.findOne({ facultyCode: req.body.facultyCode });

  if (faculty) {
    req.session.selectedFaculty = faculty._id;
    return res.redirect("/student/dashboard");
  }

  res.send("❌ Invalid Faculty Code!");
});

// ✅ Student Dashboard (Now shows only the selected faculty’s uploads)
app.get("/student/dashboard", async (req, res) => {
  if (!req.session.student || !req.session.selectedFaculty) return res.redirect("/student-login");

  const facultyId = req.session.selectedFaculty;

  const notes = await Note.find({ facultyId });
  const youtubeLinks = await Link.find({ facultyId, type: "youtube" });
  const githubLinks = await Link.find({ facultyId, type: "github" });
  const quizzes = await Quiz.find({ facultyId });

  res.render("student-dashboard", { notes, youtubeLinks, githubLinks, quizzes });
});

// ✅ Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
