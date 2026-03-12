import React from "react";

function Dashboard({ expenses }) {
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTotal = expenses
    .filter((e) => e.date === todayStr)
    .reduce((s, e) => s + Number(e.amount), 0);

  const monthStr = todayStr.substring(0, 7);
  const monthTotal = expenses
    .filter((e) => e.date.startsWith(monthStr))
    .reduce((s, e) => s + Number(e.amount), 0);

  const catMap = {};
  expenses.forEach(({ category, amount }) => {
    catMap[category] = (catMap[category] || 0) + Number(amount);
  });
  const topCat = Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a])[0] || "—";

  return (
    <section className="dashboard-cards">
      <div className="card summary-box">
        <div className="summary-icon total-icon">💰</div>
        <div className="summary-info">
          <p className="summary-label">Total Expenses</p>
          <h3 className="summary-value">₹{total.toLocaleString("en-IN")}</h3>
        </div>
      </div>
      <div className="card summary-box">
        <div className="summary-icon today-icon">📅</div>
        <div className="summary-info">
          <p className="summary-label">Today's Spending</p>
          <h3 className="summary-value">₹{todayTotal.toLocaleString("en-IN")}</h3>
        </div>
      </div>
      <div className="card summary-box">
        <div className="summary-icon month-icon">🗓️</div>
        <div className="summary-info">
          <p className="summary-label">This Month</p>
          <h3 className="summary-value">₹{monthTotal.toLocaleString("en-IN")}</h3>
        </div>
      </div>
      <div className="card summary-box">
        <div className="summary-icon top-icon">🔥</div>
        <div className="summary-info">
          <p className="summary-label">Top Category</p>
          <h3 className="summary-value">{topCat}</h3>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
