const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const Expense = require("./models/Expense");

const app = express();

app.use(cors());
app.use(express.json());

// 1) Static folder
const publicPath = path.join(__dirname, "public");
console.log("Static folder:", publicPath);
app.use(express.static(publicPath));

// 2) API routes

// Get all expenses
app.get("/api/expenses", async (req, res) => {
  const expenses = await Expense.find();
  res.json(expenses);
});

// Add expense
app.post("/api/expenses", async (req, res) => {
  const expense = new Expense(req.body);
  await expense.save();
  res.json({ message: "Added" });
});

// Delete expense
app.delete("/api/expenses/:id", async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// Edit expense
app.put("/api/expenses/:id", async (req, res) => {
  await Expense.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Updated" });
});

// Filter by date
app.get("/api/expenses/filter", async (req, res) => {
  const { from, to } = req.query;
  const data = await Expense.find({
    date: { $gte: from, $lte: to },
  });
  res.json(data);
});

// 3) Root route → serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// 4) Start server
connectDB();

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
