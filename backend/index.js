const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const paymentRoutes = require("./api/routes/paymentRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://edutech-final.vercel.app', // Replace with your actual frontend URL
];

const corsOptions = {
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.options(/.*/, cors(corsOptions)); // Enable pre-flight for all routes
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("EduTech backend is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
