import React from "react";

function ExpenseList({ expenses, deleteExpense, onEdit }) {
  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🗂️</span>
        <p>No expenses found. Add your first one!</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d} ${months[+m - 1]} ${y}`;
  };

  const CATEGORY_ICONS = {
    Food: "🍔", Transport: "🚕", Shopping: "🛍️",
    Entertainment: "🍿", Bills: "📄", Others: "📦",
  };

  return (
    <>
      <div className="list-legend">
        <span>Title</span>
        <span>Category</span>
        <span>Amount</span>
        <span>Date</span>
        <span className="col-right">Actions</span>
      </div>
      <ul className="expense-list">
        {expenses.map((expense) => (
          <li key={expense._id} className="expense-item">
            <div className="expense-row">
              <div className="exp-title">{expense.title}</div>
              <div className="exp-category">
                {CATEGORY_ICONS[expense.category] || "📦"} {expense.category}
              </div>
              <div className="exp-amount">₹{Number(expense.amount).toLocaleString("en-IN")}</div>
              <div className="exp-date">{formatDate(expense.date)}</div>
              <div className="exp-actions">
                <button
                  className="action-icon edit-icon"
                  title="Edit"
                  onClick={() => onEdit(expense)}
                >
                  ✏️
                </button>
                <button
                  className="action-icon delete-icon"
                  title="Delete"
                  onClick={() => deleteExpense(expense._id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}


export default ExpenseList;