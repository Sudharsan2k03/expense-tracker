const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const Expense = require("./models/Expense");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Static folder
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

/* ---------------- API ROUTES ---------------- */
// ... (existing routes)

/* ---------------- SERVER ---------------- */

// Get all expenses
app.get("/api/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add expense
app.post("/api/expenses", async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.json({ message: "Expense added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
app.delete("/api/expenses/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update expense
app.put("/api/expenses/:id", async (req, res) => {
  try {
    await Expense.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Expense updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Filter expenses by date
app.get("/api/expenses/filter", async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await Expense.find({
      date: { $gte: from, $lte: to },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------------- SERVER ---------------- */


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});