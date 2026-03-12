import React, { useState, useEffect } from "react";
import Flatpickr from "react-flatpickr";
import CustomSelect from "./CustomSelect";

function EditModal({ expense, isOpen, onClose, onUpdate }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.amount);
      setCategory(expense.category);
      setDate(expense.date);
    }
  }, [expense]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const d = date instanceof Date ? date.toISOString().split("T")[0] : date;
    onUpdate(expense._id, { title, amount: Number(amount), category, date: d });
  };

  return (
    <div className="modal-overlay open" onClick={(e) => e.target.className === "modal-overlay open" && onClose()}>
      <div className="modal card">
        <div className="modal-header">
          <h2 className="card-title">✏️ Edit Expense</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
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
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn ghost-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary-btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditModal;
