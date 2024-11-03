const express = require("express");
const app = express();
const PORT = 3000;
const mysql = require("mysql2");

// Create a connection
const connection = mysql.createConnection({
  host: "127.0.0.1", // your MySQL server host
  user: "root", // your MySQL username
  password: "0398445870", // your MySQL password
  database: "ctuintern", // your database name
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    return console.error("Error connecting: " + err.message);
  }
  console.log("Connected to the MySQL server.");
});

const news = require("./data/news");
const favorite = require("./data/favorite");
var user = require("./data/user");
const apply = require("./data/apply");
const internProfile = require("./data/internProfile");
const task = require("./data/task");
const myClass = require("./data/class");
var studentInternList = require("./data/studentInternList");

// NEWS SESSION
// Get all news
app.get("/news", (req, res) => {
  const query = "SELECT * FROM News";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});

// Get favorite news by studentID
app.get("/favoriteNews/:userID", (req, res) => {
  const userID = req.params.userID;
  const query =
    "select news.* from news, favorite where favorite.studentID = '" +
    userID +
    "' and favorite.newID = news.newID;";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});

// Add a news to favorite
app.post("/addNewsToFavorite/:userID/:newsID", (req, res) => {
  const userID = req.params.userID;
  const newsID = req.params.newsID;

  // Construct the SQL query
  const query =
    "INSERT INTO favorite VALUES('" + userID + "', '" + newsID + "');";

  // Insert data into the database
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res.status(500).json({ error: "Database query error" });
    }
    res.sendStatus(204);
  });
});

// Remove news from favorite
app.post("/removeNewsFromFavorites/:userID/:newsID", (req, res) => {
  const userID = req.params.userID;
  const newsID = req.params.newsID;

  // Construct the SQL query
  const query =
    "DELETE FROM favorite WHERE studentID = '" +
    userID +
    "' AND newID = '" +
    newsID +
    "'";

  // Insert data into the database
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res.status(500).json({ error: "Database query error" });
    }
    res.sendStatus(204);
  });
});

// Apply a new
app.post("/applyNews/:userID/:newsID", (req, res) => {
  const userID = req.params.userID;
  const newsID = req.params.newsID;

  // Construct the SQL query
  const query =
    "INSERT INTO AppliedNews VALUES('" + userID + "', '" + newsID + "', null);";

  // Insert data into the database
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res.status(500).json({ error: "Database query error" });
    }
    res.sendStatus(204);
  });
});

// Get intern profile
app.get("/getInternProfile/:userID", (req, res) => {
  const userID = req.params.userID;
  const query =
    "select * from InternProfile where studentID = '" + userID + "'";
  const finalResult = {
    internID: {},
    news: {},
    student: {},
    internReport: {},
  };

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res.status(500).json({ error: "Database query error" });
    }
    if (results.length > 0) {
      finalResult.internID = results[0].internID;

      const newRow = results[0];
      const newID = newRow.newID;
      console.log("newID:", newID);

      const newQuery = "select * from news where newID ='" + newID + "'";
      connection.query(newQuery, (err, newResults) => {
        if (err) {
          console.error("Error executing second query:", err);
          return;
        }

        if (newResults.length > 0) {
          finalResult.news = newResults[0];
          res.json(finalResult);
          console.log("Final Result:", finalResult);
        } else {
          console.log("No class found with the provided classID.");
        }

        connection.end();
      });

      const reportRow = results[0];
      const reportID = reportRow.reportID;
      console.log("reportID:", reportID);

      const studentRow = results[0];
      const studentID = studentRow.studentID;
      console.log("studentID:", studentID);
    } else {
      console.log("No results found.");
    }
  });
});

// USER SESSION
// Log in user
app.post("/login", (req, res) => {
  const data = req.body;

  console.log("Received data: ", data);

  res.status(201).json(user);
});

// PROFILE SESSION
// Update CV
app.patch("/update/CV/:userID", (req, res) => {
  const newsID = req.params.id;
  const newProfile = req.body;

  const index = favorite.findIndex((news) => news.newsID === newsID);

  if (index !== -1) {
    user.profile = newProfile;
    return res.sendStatus(204);
  }

  res.sendStatus(404);
});

// Update student report
app.patch("/uploadReport/:reportID", (req, res) => {
  const newsID = req.params.reportID;
  const report = req.body;

  internProfile.internReport.studentReportPath = report;

  res.sendStatus(204);
});

//Update profile picture
app.post("/updateProfilePicture/:studentID", (req, res) => {
  const studentID = req.params.studentID;
  const profilePicture = req.body;

  user.profilePicture = profilePicture;

  res.sendStatus(204);
});

// Update profile
app.patch("/updateProfile", (req, res) => {
  const edittedUser = req.body;
  user = edittedUser;
  res.sendStatus(204);
});

// TASK SESSION
app.get("/getTasks/:userID", (req, res) => {
  const userID = req.params.userID;
  res.json(task);
});

// CLASS SESSION
// Get list of class
app.get("/classes/:teacherID", (req, res) => {
  const teacherID = req.params.teacherID;
  res.json(myClass);
});

// Get list of student by classID
app.get("/studentInternList/:classID", (req, res) => {
  const classID = req.params.classID;
  res.json(studentInternList);
});

// SEARCH SESSION
app.get("/search", (req, res) => {
  const stringQuery = req.query.search.toLowerCase();
  if (!stringQuery) {
    return res.status(400).json({ message: "Search query is required" });
  }

  const searchList = news.filter(
    (news) =>
      (news.title && news.title.toLowerCase().includes(stringQuery)) ||
      (news.content && news.content.toLowerCase().includes(stringQuery)) ||
      (news.location && news.location.toLowerCase().includes(stringQuery)) ||
      (news.employer &&
        news.employer.userName &&
        news.employer.userName.toLowerCase().includes(stringQuery))
  );

  if (searchList.length > 0) {
    res.status(200).json(searchList);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
