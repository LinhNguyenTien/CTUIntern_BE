const express = require("express");
const app = express();
app.use(express.json());
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

// NEWS SESSION
// Get all news
app.get("/news", (req, res) => {
  const query = `
    SELECT 
      News.newID,
      News.title,
      News.content,
      News.postDay,
      News.quantity,
      News.salary,
      News.location,
      News.expireDay,
      JSON_OBJECT(
        'userID', User.userID,
        'userName', User.userName,
        'account', User.account,
        'phone', User.phone,
        'email', User.email,
        'profilePicture', User.profilePicture,
        'role', User.role,
        'employerID', Employer.employerID,
        'address', Employer.address,
        'websiteAddress', Employer.websiteAddress,
        'size', Employer.size,
        'field', Employer.field
      ) AS employer
    FROM News
    JOIN Employer ON News.employerID = Employer.userID
    JOIN User ON Employer.userID = User.userID
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res
        .status(500)
        .json({ error: "Get news fail, Database query error" });
    }
    console.log(results);
    res.json(results);
  });
});

// Check news is favorited
app.post("/isFavoriteNews/:userID/:newsID", (req, res) => {
  const userID = req.params.userID;
  const newID = req.params.newsID;

  const query = "select * from favorite where studentID = ? and newID = ?;";
  connection.query(query, [userID, newID], (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res
        .status(500)
        .json({ error: "Get check favorite news fail, Database query error" });
    }

    if (results.length > 0) {
      res.sendStatus(201);
    } else {
      res.sendStatus(202);
    }
  });
});

// Check news is applied
app.post("/isAppliedNew/:userID/:newsID", (req, res) => {
  const userID = req.params.userID;
  const newID = req.params.newsID;

  const query = "select * from appliednews where studentID = ? and newID = ?;";
  connection.query(query, [userID, newID], (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res
        .status(500)
        .json({ error: "Get check favorite news fail, Database query error" });
    }

    if (results.length > 0) {
      res.sendStatus(201);
    } else {
      res.sendStatus(202);
    }
  });
});

// Get favorite news by studentID
app.get("/favoriteNews/:userID", (req, res) => {
  const userID = req.params.userID;

  // Query to get favorite news for the student
  const newsQuery = `
    SELECT news.* 
    FROM news 
    INNER JOIN favorite ON favorite.newID = news.newID 
    WHERE favorite.studentID = ?`;

  connection.query(newsQuery, [userID], (err, newsResults) => {
    if (err) {
      console.error("Error fetching news data: " + err.message);
      return res.status(500).json({ error: "Database query error" });
    }

    // If there are no news results, return an empty array
    if (newsResults.length === 0) {
      return res.json([]);
    }

    // Array to store promises for each employer query
    const employerPromises = newsResults.map((newsItem) => {
      const employerQuery = `
        SELECT employer.userID, employer.employerID, employer.address, employer.websiteAddress, 
               employer.size, employer.field, user.userName, user.phone, user.email, user.profilePicture 
        FROM Employer AS employer
        INNER JOIN User AS user ON employer.userID = user.userID
        WHERE employer.userID = ?`;

      // Wrap the query in a promise to handle asynchronous fetching of employer data
      return new Promise((resolve, reject) => {
        connection.query(
          employerQuery,
          [newsItem.employerID],
          (err, employerResults) => {
            if (err) {
              return reject(err);
            }

            // Replace employerID with the full employer object if found
            if (employerResults.length > 0) {
              newsItem.employer = employerResults[0];
            } else {
              newsItem.employer = null;
            }

            // Remove the employerID field from the news item
            delete newsItem.employerID;

            resolve(newsItem);
          }
        );
      });
    });

    // Execute all employer queries and send the final result
    Promise.all(employerPromises)
      .then((resultsWithEmployers) => res.json(resultsWithEmployers))
      .catch((err) => {
        console.error("Error fetching employer data: " + err.message);
        res.status(500).json({ error: "Error fetching employer data" });
      });
  });
});

// get applied news
app.get("/getApplyNews/:userID", (req, res) => {
  const userID = req.params.userID;

  // Query to fetch news and related room data
  const query = `
    SELECT 
      news.newID,
      news.title,
      news.content,
      news.postDay,
      news.quantity,
      news.salary,
      news.location,
      news.expireDay,
      Employer.userID AS employerUserID,
      Employer.employerID,
      Employer.address,
      Employer.websiteAddress,
      Employer.size,
      Employer.field,
      User.userName,
      User.account,
      User.password,
      User.phone,
      User.email,
      User.profilePicture,
      User.role,
      Room.roomID,
      Room.roomTitle,
      Room.interviewerName,
      Room.interviewDay,
      Room.duration
    FROM 
      news
    INNER JOIN 
      appliednews ON appliednews.newID = news.newID
    INNER JOIN 
      Employer ON news.employerID = Employer.userID
    INNER JOIN 
      User ON Employer.userID = User.userID
    LEFT JOIN 
      Room ON appliednews.roomID = Room.roomID
    WHERE 
      appliednews.studentID = ?;
  `;

  connection.query(query, [userID], (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res
        .status(500)
        .json({ error: "Failed to fetch applied news with room details" });
    }

    // Map results to format the response as desired
    const formattedResults = results.map((news) => ({
      news: {
        newID: news.newID,
        title: news.title,
        content: news.content,
        postDay: news.postDay,
        quantity: news.quantity,
        salary: news.salary,
        location: news.location,
        expireDay: news.expireDay,
        employer: {
          userID: news.employerUserID,
          employerID: news.employerID,
          address: news.address,
          websiteAddress: news.websiteAddress,
          size: news.size,
          field: news.field,
          userName: news.userName,
          account: news.account,
          password: news.password,
          phone: news.phone,
          email: news.email,
          profilePicture: news.profilePicture,
          role: news.role,
        },
      },
      room: news.roomID
        ? {
            roomID: news.roomID,
            roomTitle: news.roomTitle,
            interviewerName: news.interviewerName,
            interviewDay: news.interviewDay,
            duration: news.duration,
          }
        : null, // Set room to null if roomID is not found
    }));

    res.json(formattedResults);
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
      return res
        .status(500)
        .json({ error: "add news to favorite fail, Database query error" });
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
      return res.status(500).json({
        error: "remove news from favorite fail, Database query error",
      });
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
      return res
        .status(500)
        .json({ error: "apply news fail, Database query error" });
    }
    res.sendStatus(204);
  });
});

// Get intern profile
const queryNew = (newID) => {
  return new Promise((resolve, reject) => {
    db.query(
      "select * from news where newID ='" + newID + "'",
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  });
};

const queryReport = (reportID) => {
  return new Promise((resolve, reject) => {
    db.query(
      "select * from InternReport where reportID ='" + reportID + "'",
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  });
};

const queryStudent = (studentID) => {
  return new Promise((resolve, reject) => {
    db.query(
      "select * from Student where userID ='" + studentID + "'",
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  });
};

app.get("/getInternProfile/:userID", async (req, res) => {
  const userID = req.params.userID;
  const finalResult = {
    internID: null,
    news: {},
    student: {},
    internReport: {},
  };

  try {
    // Query for InternProfile
    const internProfileQuery = `SELECT * FROM InternProfile WHERE studentID = '${userID}'`;
    const internProfileResults = await new Promise((resolve, reject) => {
      connection.query(internProfileQuery, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (internProfileResults.length > 0) {
      const firstRow = internProfileResults[0];
      finalResult.internID = firstRow.internID;

      // Parallel queries for related data using the IDs from internProfile
      const [newsData, studentData, reportData] = await Promise.all([
        queryDatabase(`SELECT * FROM News WHERE newID = '${firstRow.newID}'`),
        queryDatabase(
          `SELECT * FROM Student, User WHERE Student.userID = User.userID AND Student.userID = '${firstRow.studentID}'`
        ),
        queryDatabase(
          `SELECT * FROM InternReport WHERE reportID = '${firstRow.reportID}'`
        ),
      ]);

      finalResult.student = studentData[0];
      finalResult.internReport = reportData[0];

      if (newsData.length > 0) {
        const newsItem = newsData[0]; // Get the first news item
        const employerID = newsItem.employerID;

        if (employerID) {
          const employerData = await queryDatabase(
            `SELECT * FROM User, Employer WHERE User.userID = Employer.userID AND Employer.userID = '${employerID}'`
          );
          newsItem.employer = employerData[0]; // Add employer data as a nested object
        }

        finalResult.news = newsItem; // Assign the single news object
      }

      // Send the final result
      res.json(finalResult);
    } else {
      res
        .status(404)
        .json({ message: "No intern profile found for this user." });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Database query error" });
  }
});

function queryDatabase(query, params) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// USER SESSION

// Create user
app.post("/createUser", async (req, res) => {
  const {
    userID,
    userName,
    account,
    password,
    phone,
    email,
    profilePicture,
    role,
    employerID,
    address,
    websiteAddress,
    size,
    field,
  } = req.body;

  try {
    // Query to insert user
    const createUserQuery = `INSERT INTO User (userID, userName, account, password, phone, email, profilePicture, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
    const createEmployerQuery = `INSERT INTO Employer (userID, employerID, address, websiteAddress, size, field) VALUES (?, ?, ?, ?, ?, ?);`;

    // Execute the user creation query
    const createUserResult = await queryDatabase(createUserQuery, [
      userID,
      userName,
      account,
      password,
      phone,
      email,
      profilePicture,
      role,
    ]);

    // Check if the user insert was successful by examining affectedRows
    if (createUserResult.affectedRows > 0) {
      // Execute the employer creation query
      const createEmployerResult = await queryDatabase(createEmployerQuery, [
        userID,
        employerID,
        address,
        websiteAddress,
        size,
        field,
      ]);

      if (createEmployerResult.affectedRows > 0) {
        res.sendStatus(204); // User and employer created successfully
      } else {
        // Rollback user creation if employer creation fails
        await queryDatabase(`DELETE FROM User WHERE userID = ?`, [userID]);
        res.status(500).json({ error: "Create employer failed." });
      }
    } else {
      res.status(500).json({ error: "Create user failed." });
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    res.status(500).json({ error: "Database query error" });
  }
});

// Log in user
app.post("/login", async (req, res) => {
  console.log("call login method");
  const { email, password } = req.body;
  console.log("Received email:", email);
  console.log("Received password:", password);
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Query to find user by email and password
    var query = `SELECT * FROM User WHERE email = ? AND password = ?`;
    var userResults = await queryDatabase(query, [email, password]);

    if (userResults.length > 0) {
      // User found, return the user object (assuming only one match)
      var user = userResults[0];
      var role = user.role;
      query =
        "SELECT * FROM User," +
        role +
        " WHERE User.userID = " +
        role +
        ".userID AND User.email = ? AND User.password = ?";
      userResults = await queryDatabase(query, [email, password]);
      if (userResults.length > 0) {
        user = userResults[0];
        res.json(user);
      } else {
        // No user found with the provided credentials
        res.status(401).json({ error: "Invalid email or password." });
      }
    } else {
      // No user found with the provided credentials
      res.status(401).json({ error: "Invalid email or password." });
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    res.status(500).json({ error: "create user fail, Database query error" });
  }
});

app.get("/profile/:userID", (req, res) => {
  const userID = req.params.userID;
  const query = "SELECT * FROM profile WHERE userID = ?";

  connection.query(query, [userID], (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res
        .status(500)
        .json({ error: "Failed to get profile, database query error" });
    }
    if (results.length === 1) {
      res.json(results[0]); // Return a single object if there is exactly one result
    } else {
      res.status(404).json({ error: "Profile not found" }); // Return a 404 error if no profile was found
    }
  });
});

// PROFILE SESSION
// Update CV
app.patch("/update/CV/:userID", (req, res) => {
  const userID = req.params.userID;
  const { profileID, CVPath } = req.body;
  console.log(profileID);
  console.log(CVPath);
  const query =
    "UPDATE Profile SET CVPath = '" +
    CVPath +
    "' WHERE userID = '" +
    userID +
    "';";

  // Insert data into the database
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res.status(500).json({ error: "Database query error" });
    }
    res.sendStatus(204);
  });
});

// Update student report
app.patch("/uploadReport/:reportID", (req, res) => {
  const reportID = req.params.reportID;
  const { path } = req.body;
  const query =
    "UPDATE InternReport SET studentReportPath = '" +
    path +
    "' WHERE reportID = '" +
    reportID +
    "';";

  // Insert data into the database
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res.status(500).json({ error: "Database query error" });
    }
    res.sendStatus(204);
  });
});

//Update profile picture
app.patch("/updateProfilePicture/:userID", (req, res) => {
  const userID = req.params.userID;
  const { path } = req.body;
  const query =
    "UPDATE User SET profilePicture = '" +
    path +
    "' WHERE userID = '" +
    userID +
    "';";

  // Insert data into the database
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res.status(500).json({ error: "Database query error" });
    }
    res.sendStatus(204);
  });
});

// Update profile
app.patch("/updateProfile", (req, res) => {
  const { userID, phone } = req.body;

  // Check if both userID and phone are provided
  if (!userID || !phone) {
    return res.status(400).json({ error: "userID and phone are required" });
  }

  // Use parameterized query to avoid SQL injection
  const query = "UPDATE User SET phone = ? WHERE userID = ?";

  connection.query(query, [phone, userID], (err, results) => {
    if (err) {
      console.error("Error executing query: " + err.message);
      return res.status(500).json({ error: "Database query error" });
    }

    // Check if the query actually updated any rows
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.sendStatus(204); // No content, successful update
  });
});

// TASK SESSION
app.get("/getTasks/:userID", async (req, res) => {
  const userID = req.params.userID;

  // Query to get tasks by userID
  const taskQuery = `
    SELECT Task.* 
    FROM TaskDetail
    JOIN Task ON TaskDetail.taskID = Task.taskID
    JOIN User ON TaskDetail.studentID = User.userID
    WHERE User.userID = ?;
  `;

  try {
    // Fetch tasks associated with the userID
    const tasks = await new Promise((resolve, reject) => {
      connection.query(taskQuery, [userID], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });

    // Collect unique teacherIDs from the tasks
    const teacherIDs = [...new Set(tasks.map((task) => task.teacherID))];
    // Fetch Teacher objects for each unique teacherID
    const teacherPromises = teacherIDs.map((teacherID) => {
      const teacherQuery = `SELECT * FROM User, Teacher WHERE User.userID = Teacher.userID AND Teacher.userID = ?`;
      return new Promise((resolve, reject) => {
        connection.query(teacherQuery, [teacherID], (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results[0]); // Assume one result per teacherID
        });
      });
    });

    // Resolve all teacher queries
    const teachers = await Promise.all(teacherPromises);

    // Map teacher objects by teacherID for easy access
    const teacherMap = {};
    teachers.forEach((teacher) => {
      teacherMap[teacher.userID] = teacher;
    });

    // Attach the Teacher object to each task based on teacherID
    const tasksWithTeachers = tasks.map((task) => ({
      ...task,
      teacher: teacherMap[task.teacherID] || null, // Add teacher or null if not found
    }));

    res.json(tasksWithTeachers);
  } catch (error) {
    console.error("Error fetching data: " + error.message);
    res.status(500).json({ error: "Database query error" });
  }
});

app.get("/getTaskDetail/:userID/:taskID", async (req, res) => {
  const taskID = req.params.taskID;
  const userID = req.params.userID;
  console.log("call getTaskDetail");
  const query = `
    SELECT * 
    FROM TaskDetail 
    WHERE studentID = ? AND taskID = ?`;

  try {
    // Fetch task details
    const results = await new Promise((resolve, reject) => {
      connection.query(query, [userID, taskID], (err, results) => {
        if (err) {
          console.error("Error fetching data: " + err.message);
          return reject(err);
        }
        console.log(results);
        resolve(results);
      });
    });

    if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      res.status(404).json({ message: "Task not found for this user." });
    }
  } catch (error) {
    console.error("Error fetching data: " + error.message);
    res.status(500).json({ error: "Database query error." });
  }
});

app.post("/submitTask/:studentID/:taskID", async (req, res) => {
  const studentID = req.params.studentID;
  const taskID = req.params.taskID;
  const path = req.body.path; // Extract the 'path' field from the request body

  if (!path) {
    return res.status(400).json({ error: "Path is required." }); // Validate input
  }

  const query = `
    UPDATE TaskDetail 
    SET path = ? 
    WHERE taskID = ? AND studentID = ?`;

  connection.query(query, [path, taskID, studentID], (err, results) => {
    if (err) {
      console.error("Error updating data: " + err.message);
      return res
        .status(500)
        .json({ error: "Failed to update TaskDetail. Database error." });
    }

    // Check if any rows were affected
    if (results.affectedRows > 0) {
      res.status(200).json({ message: "Task updated successfully." });
    } else {
      res.status(404).json({ message: "Task not found for this student." });
    }
  });
});

// get tasks by classID
app.get("/taskList/:classID", async (req, res) => {
  const classID = req.params.classID;
  const query = `
    SELECT DISTINCT
    t.taskID, 
    t.title, 
    t.content, 
    t.expiredDay, 
    t.teacherID
    FROM Task t
    RIGHT JOIN TaskDetail td ON t.taskID = td.taskID
    WHERE t.teacherID IN (
      SELECT sd.teacherID
      FROM StudyDetail sd
      WHERE sd.classID = ?
    );`;

  try {
    // SQL query to fetch tasks based on classID
    const tasks = await queryDatabase(query, [classID])
    if (tasks.length > 0) {
      res.json(tasks)
    }
    else {
      res.status(401).json({ error: "Query task fail"})
    }
  } catch (error) {
    console.error("Error fetching tasks by classID:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// CLASS SESSION

// Get class per userID (for student)
app.get("/getClass/:userID", (req, res) => {
  const userID = req.params.userID;

  // Query to get classes with major and faculty details included
  const query = `
    SELECT DISTINCT Class.classID, Class.classCode, Class.className, 
           Major.majorID, Major.majorName, Major.majorRoadMapURL, Major.facultyID,
           Faculty.facultyName, Faculty.schoolName
    FROM Class
    JOIN StudyDetail ON Class.classID = StudyDetail.classID
    JOIN Major ON Class.majorID = Major.majorID
    JOIN Faculty ON Major.facultyID = Faculty.facultyID
    WHERE StudyDetail.studentID = ?;
  `;

  connection.query(query, [userID], (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res.status(500).json({ error: "Database query error" });
    }

    // Format the results to include major and faculty as objects inside each class
    const formattedResults = results.map((row) => ({
      classID: row.classID,
      classCode: row.classCode,
      className: row.className,
      major: {
        majorID: row.majorID,
        majorName: row.majorName,
        majorRoadMapURL: row.majorRoadMapURL,
        faculty: {
          facultyID: row.facultyID,
          facultyName: row.facultyName,
          schoolName: row.schoolName,
        },
      },
    }));

    res.json(formattedResults[0]);
  });
});

// Get list of class
app.get("/classes/:teacherID", (req, res) => {
  const teacherID = req.params.teacherID;

  // Query to get classes with major and faculty details included
  const query = `
    SELECT DISTINCT Class.classID, Class.classCode, Class.className, 
           Major.majorID, Major.majorName, Major.majorRoadMapURL, Major.facultyID,
           Faculty.facultyName, Faculty.schoolName
    FROM Class
    JOIN StudyDetail ON Class.classID = StudyDetail.classID
    JOIN Major ON Class.majorID = Major.majorID
    JOIN Faculty ON Major.facultyID = Faculty.facultyID
    WHERE StudyDetail.teacherID = ?;
  `;

  connection.query(query, [teacherID], (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res.status(500).json({ error: "Database query error" });
    }

    // Format the results to include major and faculty as objects inside each class
    const formattedResults = results.map((row) => ({
      classID: row.classID,
      classCode: row.classCode,
      className: row.className,
      major: {
        majorID: row.majorID,
        majorName: row.majorName,
        majorRoadMapURL: row.majorRoadMapURL,
        faculty: {
          facultyID: row.facultyID,
          facultyName: row.facultyName,
          schoolName: row.schoolName,
        },
      },
    }));

    res.json(formattedResults);
  });
});

// Get list of student by classID
app.get("/studentList/:classID", (req, res) => {
  const classID = req.params.classID;

  const query = `
    SELECT 
      Student.studentID,
      Student.studyTime,
      Student.GPA,
      User.userID,
      User.userName,
      User.account,
      User.phone,
      User.email,
      User.profilePicture,
      User.role
    FROM 
      StudyDetail
    JOIN 
      Student ON StudyDetail.studentID = Student.userID
    JOIN 
      User ON Student.userID = User.userID
    WHERE 
      StudyDetail.classID = ?;
  `;

  connection.query(query, [classID], (err, results) => {
    if (err) {
      console.error("Error fetching students: " + err.message);
      return res.status(500).json({ error: "Database query error" });
    }

    res.json(results);
  });
});

// SEARCH SESSION
app.get("/search", (req, res) => {
  const searchTerm = req.query.query;

  const query = `
    SELECT 
      News.newID, News.title, News.content, News.postDay, News.quantity, 
      News.salary, News.location, News.expireDay,
      JSON_OBJECT(
        'userID', User.userID, 
        'userName', User.userName, 
        'account', User.account, 
        'phone', User.phone, 
        'email', User.email, 
        'profilePicture', User.profilePicture, 
        'role', User.role, 
        'employerID', Employer.employerID, 
        'address', Employer.address, 
        'websiteAddress', Employer.websiteAddress, 
        'size', Employer.size, 
        'field', Employer.field
      ) AS employer
    FROM News
    LEFT JOIN Employer ON News.employerID = Employer.userID
    LEFT JOIN User ON Employer.userID = User.userID
    WHERE 
      News.title LIKE ? OR 
      News.content LIKE ? OR 
      News.location LIKE ? OR
      User.userName LIKE ?;
  `;

  const searchValue = `%${searchTerm}%`;

  connection.query(
    query,
    [searchValue, searchValue, searchValue, searchValue],
    (err, results) => {
      if (err) {
        console.error("Error searching news: " + err.message);
        return res.status(500).json({ error: "Database query error" });
      }

      res.json(results);
    }
  );
});

// Teacher session
app.get("/getTeacher/:userID", async (req, res) => {
  const userID = req.params.userID;

  const query = `
    SELECT 
        User.userID, 
        User.userName, 
        User.account, 
        User.password, 
        User.phone, 
        User.email, 
        User.profilePicture, 
        User.role,
        Teacher.teacherID
    FROM 
        StudyDetail
    JOIN 
        Teacher ON StudyDetail.teacherID = Teacher.userID
    JOIN 
        User ON Teacher.userID = User.userID
    WHERE 
        StudyDetail.studentID = ?;
  `;

  try {
    // Execute the query
    const results = await new Promise((resolve, reject) => {
      connection.query(query, [userID], (err, results) => {
        if (err) return reject(err); // Reject promise on error
        resolve(results); // Resolve with query results
      });
    });

    // Check if results exist
    if (results.length > 0) {
      res.json(results[0]); // Send teacher details as JSON
    } else {
      res.status(404).json({ message: "No teacher found for this student." });
    }
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({ error: "Database query error" });
  }
});

// REVIEW SESSION
app.get("/reviews", (req, res) => {
  const query = `
    SELECT 
      Review.reviewID,
      Review.studentID,
      Review.reviewDay,
      Review.content,
      Review.options,
      JSON_OBJECT(
        'userID', User.userID,
        'userName', User.userName,
        'account', User.account,
        'phone', User.phone,
        'email', User.email,
        'profilePicture', User.profilePicture,
        'role', User.role,
        'employerID', Employer.employerID,
        'address', Employer.address,
        'websiteAddress', Employer.websiteAddress,
        'size', Employer.size,
        'field', Employer.field
      ) AS employer
    FROM Review
    JOIN Employer ON Review.employerID = Employer.userID
    JOIN User ON Employer.userID = User.userID
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching data: " + err.message);
      return res
        .status(500)
        .json({ error: "Get news fail, Database query error" });
    }
    console.log(results);
    res.json(results);
  });
});

app.listen(PORT, "192.168.100.15", () => {
  console.log(`Server is running on http://192.168.100.15:${PORT}`);
});
