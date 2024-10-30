const express = require("express");
const app = express();
const PORT = 3000;

const news = require("./data/news");
const favorite = require("./data/favorite");
var user = require("./data/user");
const apply = require("./data/apply");
const internProfile = require("./data/internProfile");
const task = require("./data/task");
const myClass = require("./data/class");
var studentInternList = require("./data/studentInternList")

// NEWS SESSION
// Get all news
app.get("/news", (req, res) => {
    res.json(news);
});

// Get favorite news by studentID
app.get("/favoriteNews/1", (req, res) => {
    res.json(favorite);
});

// Add a news to favorite
app.post("/addNewsToFavorite/1", (req, res) => {
    const news = req.body;

    console.log('Received data: ', news);

    favorite.push(news);

    res.sendStatus(201);
});

// Remove news from favorite
app.post("/removeNewsFromFavorites/1/:newID", (req, res) => {
    const newID = req.params.newID;

    const index = favorite.findIndex(news => news.newID === newID);

    if (index !== -1) {
        favorite.splice(index, 1);
        return res.sendStatus(204);
    }

    res.sendStatus(404);
});

// Apply a new
app.post("/applyNews/:userID", (req, res) => {
    const news = req.body;

    console.log('Received data: ', news);

    apply.push(news);

    res.sendStatus(201);
})

// Get apply news
app.get("/getApplyNews/:userID", (req, res) => {
    res.json(apply);
});

// Get intern profile
app.get("/getInternProfile/:userID", (req, res) => {
    res.json(internProfile)
});



// USER SESSION
// Log in user
app.post('/login', (req, res) => {
    const data = req.body;

    console.log('Received data: ', data);

    res.status(201).json(user);
});



// PROFILE SESSION
// Update CV
app.patch("/update/CV/:userID", (req, res) => {
    const newsID = req.params.id;
    const newProfile = req.body;

    const index = favorite.findIndex(news => news.newsID === newsID);

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
    const userID = req.params.userID
    res.json(task)
});



// CLASS SESSION
// Get list of class
app.get("/classes/:teacherID", (req, res) => {
    const teacherID = req.params.teacherID
    res.json(myClass)
});

// Get list of student by classID
app.get("/studentInternList/:classID", (req, res) => {
    const classID = req.params.classID
    res.json(studentInternList)
});

// SEARCH SESSION
app.get('/search', (req, res) => {
    const stringQuery = req.query.search.toLowerCase();
    if(!stringQuery) {
        return res.status(400).json({message: "Search query is required"});
    }

    const searchList = news.filter(news => 
        (news.title && news.title.toLowerCase().includes(stringQuery)) ||
        (news.content && news.content.toLowerCase().includes(stringQuery)) ||
        (news.location && news.location.toLowerCase().includes(stringQuery)) ||
        (news.employer && news.employer.userName && news.employer.userName.toLowerCase().includes(stringQuery))
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

