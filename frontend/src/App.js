import React, { useState, useEffect } from "react";
import axios from "axios";
import AddExpense from "./components/AddExpense";
import ExpenseList from "./components/ExpenseList";
import Dashboard from "./components/Dashboard";
import ChartsSection from "./components/ChartsSection";
import FilterCard from "./components/FilterCard";
import EditModal from "./components/EditModal";
import "./index.css";

const API_URL = "http://localhost:5000/api/expenses";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch all expenses
  const fetchExpenses = async (filter = null) => {
    setLoading(true);
    try {
      const url = filter
        ? `${API_URL}/filter?from=${filter.from}&to=${filter.to}`
        : API_URL;
      const res = await axios.get(url);
      setExpenses(res.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete an expense
  const deleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  // Update an expense
  const updateExpense = async (id, updatedData) => {
    try {
      await axios.put(`${API_URL}/${id}`, updatedData);
      setIsEditModalOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (expenses.length === 0) {
      alert("No expenses to export.");
      return;
    }

    const rows = [
      ["Title", "Amount (₹)", "Category", "Date"],
      ...expenses.map((e) => [
        `"${e.title.replace(/"/g, '""')}"`,
        e.amount,
        e.category,
        e.date,
      ]),
    ];

    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Initial load
  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-brand">
          <h1>💸 Expense Tracker</h1>
          <p className="subtitle">Track your daily spending in one place.</p>
        </div>
        <button className="btn secondary-btn" onClick={exportToCSV}>
          📥 Export CSV
        </button>
      </header>

      {/* Summary Stats */}
      <Dashboard expenses={expenses} />

      {/* Visual Analytics */}
      <ChartsSection expenses={expenses} />

      <div className="app-main">
        <aside className="left-column">
          <div className="card form-card">
            <h2 className="card-title">➕ Add New Expense</h2>
            <AddExpense fetchExpenses={fetchExpenses} />
          </div>

          <FilterCard
            onFilter={(from, to) => fetchExpenses({ from, to })}
            onClear={() => fetchExpenses()}
          />
        </aside>

        <main className="right-column">
          <div className="card list-card">
            <div className="list-header">
              <h2 className="card-title">📋 Expense History</h2>
              <span className="expense-count">{expenses.length} records</span>
            </div>
            {loading ? (
              <div className="spinner-container">
                <div className="spinner"></div>
                <p className="spinner-text">Loading expenses...</p>
              </div>
            ) : (
              <ExpenseList
                expenses={expenses}
                deleteExpense={deleteExpense}
                onEdit={(exp) => {
                  setEditingExpense(exp);
                  setIsEditModalOpen(true);
                }}
              />
            )}
          </div>
        </main>
      </div>

      <EditModal
        expense={editingExpense}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={updateExpense}
      />
    </div>
  );
}

export default App;