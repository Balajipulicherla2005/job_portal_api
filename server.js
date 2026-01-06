const express = require("express");
const cors = require("cors");
require("dotenv").config();

// import routes
const { registerRoute, loginRoute } = require("./routes/authRoutes");
const { createJobRoute, getJobsRoute } = require("./routes/jobRoutes");

const app = express();

const corsOptions = {
  origin: ["http://localhost:3001"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// ================= AUTH ROUTES =================
app.post("/auth/register", registerRoute);
app.post("/auth/login", loginRoute);

// ================= JOB ROUTES =================
app.get("/jobs", getJobsRoute);
app.post("/jobs", createJobRoute);

// ================= SERVER =================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
