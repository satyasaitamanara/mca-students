const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
    host:"bybimdiekjxs5r5y3bm6-mysql.services.clever-cloud.com",
    user:"ulpcyfzuikf5vyok",
    password:"Ov494YIrJ7EmCXGR27Gf",
    database:"bybimdiekjxs5r5y3bm6", 
   multipleStatements: true
});
function handleDisconnect() {
    db.connect(err => {
        if (err) {
            console.error("Database Connection Failed: " + err.message);
            setTimeout(handleDisconnect, 5000); // Retry after 5 seconds
        } else {
            console.log("✅ Connected to MySQL Database!");
        }
    });

    db.on('error', err => {
        console.error("❌ Database Error: ", err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log("🔄 Reconnecting to the database...");
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

// Call the function to establish connection
handleDisconnect();

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error("Database Connection Failed: " + err.message);
        return;
    }
    console.log("Connected to MySQL Database!");
});

// Login API
app.post('/login', (req, res) => {
    const { rollno, password } = req.body;

    if (!rollno || !password) {
        return res.status(400).json({ success: false, message: "Roll Number and Password are required!" });
    }

    const query = "SELECT rollno FROM students WHERE rollno = ? AND password = ?";
    
    db.query(query, [rollno, password], (err, results) => {
        if (err) {
            console.error("Database Query Error: " + err.message);
            return res.status(500).json({ success: false, message: "Server Error!" });
        } 
        
        if (results.length > 0) {
            res.json({ success: true, rollno: results[0].rollno });
        } else {
            res.status(401).json({ success: false, message: "Invalid Roll Number or Password!" });
        }
    });
});

// API to get user details
app.get('/user/:rollno', (req, res) => {
    const rollno = req.params.rollno;

    if (!rollno || rollno === "undefined") {
        return res.status(400).json({ success: false, message: "Invalid roll number!" });
    }

    const query = "SELECT name, rollno, email, attendance_percentage FROM students WHERE rollno = ?";
    
    db.query(query, [rollno], (err, results) => {
        if (err) {
            console.error("Database Query Error: ", err);
            return res.status(500).json({ success: false, message: "Server Error!" });
        }

        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(404).json({ success: false, message: "User not found!" });
        }
    });
});

// ✅ API to retrieve image for the logged-in user
app.get("/get-image/:rollno", (req, res) => {
    const rollno = req.params.rollno;
    const sql = "SELECT image_data FROM students WHERE rollno = ?";

    db.query(sql, [rollno], (err, result) => {
        if (err) {
            console.error("❌ Database Query Failed:", err);
            return res.status(500).json({ error: "Database Query Failed", details: err.message });
        }

        if (result.length > 0) {
            const imageBuffer = result[0].image_data;

            if (!imageBuffer) {
                console.error("❌ Image Data is NULL for Roll No:", rollno);
                return res.status(404).json({ error: "Image not found in the database" });
            }

            console.log("✅ Image Retrieved Successfully for Roll No:", rollno);
            res.writeHead(200, { "Content-Type": "image/jpeg" });
            res.end(imageBuffer);
        } else {
            console.error("❌ No Image Found for Roll No:", rollno);
            res.status(404).json({ error: "No Image Found" });
        }
    });
});



// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});




