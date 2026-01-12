const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const paymentRoutes = require("./api/routes/paymentRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // or '*' for development
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("EduTech backend is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
