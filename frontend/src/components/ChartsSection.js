import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function ChartsSection({ expenses }) {
  // Pie – category totals
  const catMap = {};
  expenses.forEach(({ category, amount }) => {
    catMap[category] = (catMap[category] || 0) + Number(amount);
  });

  const doughnutData = {
    labels: Object.keys(catMap),
    datasets: [
      {
        data: Object.values(catMap),
        backgroundColor: ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#64748b"],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#94a3b8", padding: 16, font: { size: 11 } },
      },
    },
  };

  // Bar – last 6 months
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyDataMap = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthlyDataMap[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`] = 0;
  }

  expenses.forEach(({ date, amount }) => {
    const key = date.substring(0, 7);
    if (Object.prototype.hasOwnProperty.call(monthlyDataMap, key)) {
      monthlyDataMap[key] += Number(amount);
    }
  });

  const barData = {
    labels: Object.keys(monthlyDataMap).map((k) => MONTHS[+k.split("-")[1] - 1]),
    datasets: [
      {
        label: "₹ Spending",
        data: Object.values(monthlyDataMap),
        backgroundColor: "rgba(59,130,246,0.45)",
        borderColor: "#3b82f6",
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: { color: "#64748b", font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11 } },
      },
    },
  };

  return (
    <section className="charts-section">
      <div className="card chart-card">
        <h2 className="card-title">📊 Category Breakdown</h2>
        <div className="chart-wrapper pie-wrapper">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
      <div className="card chart-card">
        <h2 className="card-title">📈 Monthly Spending</h2>
        <div className="chart-wrapper bar-wrapper">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </section>
  );
}

export default ChartsSection;
