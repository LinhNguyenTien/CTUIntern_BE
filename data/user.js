var user = {
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
}
    


module.exports = user;