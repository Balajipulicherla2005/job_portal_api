const mysql = require("mysql2");
require("dotenv").config();

// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD || "Root@123",
//   database: process.env.DB_NAME,
// });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync('./aiven-certs/ca.pem'),
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// Connect to database
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ MySQL Database Connected");
  }
});

module.exports = db;

// db.connect(err => {
//   if (err) throw err;
//   console.log("MySQL Connected");
// });

// module.exports = db;
