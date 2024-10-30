const internProfile = {
    "id": "01",
    "student": {
        userID: "1",
        userName: "Alice Smith",
        account: "alice",
        password: "studentpass",
        phone: "123-456-7890",
        email: "alice@example.com",
        profilePicture: "https://example.com/alice.jpg",
        role: "student",
        studentID: "STU001",
        studyTime: "Full-Time",
        GPA: 3.8,
        classCTU: {
            classID: "1",
            classCode: "DI2096A3",
            className: "Ky thuat phan mem A3",
            major: {
                majorID: "1", 
                majorName: "Ky thuat phan mem", 
                majorRoadMapURL: "http://host.com/path/to/file"
            },
            teacher: {
                userID: "2",
                userName: "Prof. John Doe",
                account: "johndoe",
                password: "teacherpass",
                phone: "345-678-9012",
                email: "johndoe@example.com",
                profilePicture: "https://example.com/johndoe.jpg",
                role: "teacher",
                teacherID: "TCH001"
            } 
        },
        profile: { 
            profileID: "1", 
            CVPath: "https://example.com"
        }
    },
    "news": {
        newID: "1",
        title: "Software Engineer Position",
        content: "We are looking for a Software Engineer to join our team.",
        postDay: "2024-10-30",
        quantity: 3,
        salary: 70000,
        location: "San Francisco",
        expireDay: "2024-12-01",
        employer: {
            userID: "1",
            userName: "Tech Corp",
            account: "techcorp_account",
            password: "securepassword",
            phone: "123-456-7890",
            email: "info@techcorp.com",
            profilePicture: "https://example.com/profile.jpg",
            role: "employer",
            employerID: "EMP001",
            address: "123 Tech Street, SF",
            websiteAddress: "https://techcorp.com",
            size: "500-1000",
            field: "Technology"
        },
        isFavorite: false
    },
    "state": {
        stateID: "1",
        state: "Intern"
    },
    "internReport": {
        reportID: "1",
        taskListReportPath: "",
        checkListReportPath: "",
        reviewReportPath: "",
        studentReportPath: "",
        teacherReportPath: "",
        companyReviewPath: "",
        companyScore: 0.0,
        teacherReviewPath: "",
        teacherReviewScore: 0.0
    },
}
    

module.exports = internProfile;