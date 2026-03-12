import React, { useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";

function FilterCard({ onFilter, onClear }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleApply = () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates.");
      return;
    }
    // Format dates to YYYY-MM-DD
    const f = fromDate instanceof Date ? fromDate.toISOString().split("T")[0] : fromDate;
    const t = toDate instanceof Date ? toDate.toISOString().split("T")[0] : toDate;
    onFilter(f, t);
  };

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    onClear();
  };

  return (
    <div className="card filter-card">
      <h2 className="card-title">🔍 Filter by Date</h2>
      <div className="form-row">
        <div className="form-group">
          <label>From</label>
          <Flatpickr
            value={fromDate}
            onChange={([date]) => setFromDate(date)}
            options={{ dateFormat: "Y-m-d", disableMobile: true }}
            placeholder="Start date"
          />
        </div>
        <div className="form-group">
          <label>To</label>
          <Flatpickr
            value={toDate}
            onChange={([date]) => setToDate(date)}
            options={{ dateFormat: "Y-m-d", disableMobile: true }}
            placeholder="End date"
          />
        </div>
      </div>
      <div className="filter-actions">
        <button className="btn secondary-btn" onClick={handleApply}>
          Apply Filter
        </button>
        <button className="btn ghost-btn" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>
  );
}

export default FilterCard;
