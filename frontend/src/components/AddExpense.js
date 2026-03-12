import React, { useState } from "react";
import axios from "axios";
import Flatpickr from "react-flatpickr";
import CustomSelect from "./CustomSelect";
import API_URL from "../config";

function AddExpense({ fetchExpenses }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date());

  const addExpense = async (e) => {
    e.preventDefault();

    if (!title || !amount || !date) return;

    const formattedDate = date instanceof Date ? date.toISOString().split("T")[0] : date;

    try {
      await axios.post(`${API_URL}/expenses`, {
        title,
        amount: Number(amount),
        category,
        date: formattedDate
      });

      setTitle("");
      setAmount("");
      await fetchExpenses();
      alert("Expense added successfully!");
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  return (
    <form onSubmit={addExpense} className="expense-form">
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          placeholder="e.g. Lunch"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <CustomSelect
            value={category}
            onChange={(val) => setCategory(val)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Date</label>
        <Flatpickr
          value={date}
          onChange={([d]) => setDate(d)}
          options={{ dateFormat: "Y-m-d", disableMobile: true }}
          placeholder="Pick a date"
        />
      </div>

      <button type="submit" className="btn primary-btn btn-full">Add Expense</button>
    </form>
  );
}

export default AddExpense;
