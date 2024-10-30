const news = [
        {
            newID: "1",
            title: "Software Engineer Position",
            content: "We are looking for a Software Engineer to join our team.",
            postDay: "2024-10-30",
            quantity: 3,
            salary: 70000,
            location: "Hà Nội",
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
        {
            newID: "2",
            title: "Data Analyst Position",
            content: "Join our analytics team as a Data Analyst.",
            postDay: "2024-10-15",
            quantity: 1,
            salary: 60000,
            location: "Thành phố Hồ Chí Minh",
            expireDay: "2024-11-30",
            employer: {
                userID: "2",
                userName: "Data Insights",
                account: "datainsights_account",
                password: "anothersecurepassword",
                phone: "987-654-3210",
                email: "contact@datainsights.com",
                profilePicture: "https://example.com/profile2.jpg",
                role: "employer",
                employerID: "EMP002",
                address: "456 Data Drive, NY",
                websiteAddress: "https://datainsights.com",
                size: "200-500",
                field: "Data Analytics"
            },
            isFavorite: true
        }
    ]

module.exports = news;