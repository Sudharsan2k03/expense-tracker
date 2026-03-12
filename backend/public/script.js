const API_URL = "/api/expenses";

/* Chart instances */
let categoryChart = null;
let monthlyChart  = null;

/* Flatpickr */
let mainPicker, fromPicker, toPicker, editPicker;
const fpConfig = { theme: "dark", dateFormat: "Y-m-d", disableMobile: true };

/* Category icons */
const CATEGORY_ICONS = {
  Food: "🍔", Transport: "🚕", Shopping: "🛍️",
  Entertainment: "🍿", Bills: "📄", Others: "📦",
};

/* ═══════════════════════════════════════════════════════
   CUSTOM SELECT  – escapes overflow:hidden via position:fixed
════════════════════════════════════════════════════════ */
class CustomSelect {
  constructor(id) {
    this.root    = document.getElementById(id);
    this.trigger = this.root.querySelector(".cs-trigger");
    this.label   = this.root.querySelector(".cs-label");
    this.panel   = this.root.querySelector(".cs-options");
    this.options = this.root.querySelectorAll(".cs-option");

    this.trigger.addEventListener("click", e => { e.stopPropagation(); this.toggle(); });
    this.options.forEach(opt => {
      opt.addEventListener("click", () => { this.setValue(opt.dataset.value); this.close(); });
    });
    document.addEventListener("click", () => this.close());
    this._reposBound = () => this._repos();
  }

  toggle() { this.root.classList.contains("open") ? this.close() : this.open(); }

  open() {
    document.querySelectorAll(".custom-select.open").forEach(el => {
      if (el !== this.root) el.classList.remove("open");
    });
    this.root.classList.add("open");
    this.trigger.setAttribute("aria-expanded", "true");
    this._repos();
    window.addEventListener("scroll", this._reposBound, true);
    window.addEventListener("resize", this._reposBound);
  }

  close() {
    this.root.classList.remove("open");
    this.trigger.setAttribute("aria-expanded", "false");
    window.removeEventListener("scroll", this._reposBound, true);
    window.removeEventListener("resize", this._reposBound);
  }

  _repos() {
    const r = this.trigger.getBoundingClientRect();
    this.panel.style.top   = `${r.bottom + 4}px`;
    this.panel.style.left  = `${r.left}px`;
    this.panel.style.width = `${r.width}px`;
  }

  getValue() { return this.root.dataset.value; }

  setValue(value) {
    this.root.dataset.value = value;
    const matched = [...this.options].find(o => o.dataset.value === value);
    this.label.textContent = matched ? matched.textContent.trim() : value;
    this.options.forEach(o => o.classList.toggle("selected", o.dataset.value === value));
  }
}

/* Dropdown instances */
let categoryDD     = null;
let editCategoryDD = null;

/* Init on DOMContentLoaded */
document.addEventListener("DOMContentLoaded", () => {
  categoryDD     = new CustomSelect("categoryDropdown");
  editCategoryDD = new CustomSelect("editCategoryDropdown");
  initFlatpickr();
  initCharts();
  loadExpenses();
  bindForms();
});


/* ─────────────────────────────────────
   Flatpickr initialisation
───────────────────────────────────── */
function initFlatpickr() {
  mainPicker = flatpickr("#date", {
    ...fpConfig,
  });

  fromPicker = flatpickr("#fromDate", {
    ...fpConfig,
    onChange([selected]) {
      toPicker.set("minDate", selected || null);
    },
  });

  toPicker = flatpickr("#toDate", {
    ...fpConfig,
    onChange([selected]) {
      fromPicker.set("maxDate", selected || null);
    },
  });

  editPicker = flatpickr("#editDate", {
    ...fpConfig,
  });
}

/* ─────────────────────────────────────
   Charts
───────────────────────────────────── */
function initCharts() {
  const pieCtx = document.getElementById("categoryPieChart").getContext("2d");
  const barCtx = document.getElementById("monthlyBarChart").getContext("2d");

  const CHART_COLORS = ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#64748b"];

  categoryChart = new Chart(pieCtx, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: CHART_COLORS,
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#94a3b8", padding: 16, font: { size: 11 } },
        },
      },
    },
  });

  monthlyChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "₹ Spending",
        data: [],
        backgroundColor: "rgba(59,130,246,0.45)",
        borderColor: "#3b82f6",
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
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
    },
  });
}

function updateCharts(expenses) {
  /* Pie – category totals */
  const catMap = {};
  expenses.forEach(({ category, amount }) => {
    catMap[category] = (catMap[category] || 0) + Number(amount);
  });
  categoryChart.data.labels = Object.keys(catMap);
  categoryChart.data.datasets[0].data = Object.values(catMap);
  categoryChart.update();

  /* Bar – last 6 months */
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyData = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthlyData[`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`] = 0;
  }
  expenses.forEach(({ date, amount }) => {
    const key = date.substring(0, 7);
    if (Object.prototype.hasOwnProperty.call(monthlyData, key)) {
      monthlyData[key] += Number(amount);
    }
  });
  monthlyChart.data.labels = Object.keys(monthlyData).map(k => MONTHS[+k.split("-")[1] - 1]);
  monthlyChart.data.datasets[0].data = Object.values(monthlyData);
  monthlyChart.update();
}

/* ─────────────────────────────────────
   Data loading
───────────────────────────────────── */
async function loadExpenses(filter = null) {
  showSpinner(true);
  try {
    const url = filter
      ? `${API_URL}/filter?from=${filter.from}&to=${filter.to}`
      : API_URL;
    const data = await fetch(url).then(r => r.json());
    renderList(data);
    updateDashboard(data);
    updateCharts(data);
  } catch (err) {
    console.error("loadExpenses:", err);
  } finally {
    showSpinner(false);
  }
}

/* ─────────────────────────────────────
   Dashboard cards
───────────────────────────────────── */
function updateDashboard(expenses) {
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  // Today (IST-safe: compare yyyy-mm-dd string)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const todayTotal = expenses
    .filter(e => e.date === todayStr)
    .reduce((s, e) => s + Number(e.amount), 0);

  const monthStr = todayStr.substring(0, 7);
  const monthTotal = expenses
    .filter(e => e.date.startsWith(monthStr))
    .reduce((s, e) => s + Number(e.amount), 0);

  // Top category
  const catMap = {};
  expenses.forEach(({ category, amount }) => {
    catMap[category] = (catMap[category] || 0) + Number(amount);
  });
  const topCat = Object.keys(catMap).sort((a,b) => catMap[b]-catMap[a])[0] || "—";

  document.getElementById("sumTotal").textContent    = total.toLocaleString("en-IN");
  document.getElementById("sumToday").textContent    = todayTotal.toLocaleString("en-IN");
  document.getElementById("sumMonth").textContent    = monthTotal.toLocaleString("en-IN");
  document.getElementById("topCategory").textContent = topCat;
}

/* ─────────────────────────────────────
   Expense List Render
───────────────────────────────────── */
function renderList(expenses) {
  const list = document.getElementById("expenseList");
  const counter = document.getElementById("expenseCount");

  counter.textContent = `${expenses.length} record${expenses.length !== 1 ? "s" : ""}`;
  list.innerHTML = "";

  if (expenses.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🗂️</span>
        <p>No expenses found. Add your first one!</p>
      </div>`;
    return;
  }

  expenses.forEach(item => {
    const icon = CATEGORY_ICONS[item.category] || "📦";
    const li = document.createElement("li");
    li.className = "expense-item";
    li.innerHTML = `
      <div class="expense-row">
        <div class="exp-title">${escHtml(item.title)}</div>
        <div class="exp-category">${icon} ${item.category}</div>
        <div class="exp-amount">₹${Number(item.amount).toLocaleString("en-IN")}</div>
        <div class="exp-date">${formatDate(item.date)}</div>
        <div class="exp-actions">
          <button class="action-icon edit-icon" title="Edit"
            onclick="openEditModal('${item._id}','${escAttr(item.title)}','${item.amount}','${item.category}','${item.date}')">
            ✏️
          </button>
          <button class="action-icon delete-icon" title="Delete"
            onclick="openDeleteModal('${item._id}','${escAttr(item.title)}')">
            🗑️
          </button>
        </div>
      </div>`;
    list.appendChild(li);
  });
}

/* ─────────────────────────────────────
   Form Binding
───────────────────────────────────── */
function bindForms() {
  // Add
  document.getElementById("expenseForm").addEventListener("submit", async e => {
    e.preventDefault();
    const body = {
      title:    document.getElementById("title").value.trim(),
      amount:   document.getElementById("amount").value,
      category: categoryDD.getValue(),          // ← custom dropdown
      date:     document.getElementById("date").value,
    };
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to add");
      e.target.reset();
      mainPicker.clear();
      categoryDD.setValue("Food");              // reset dropdown
      loadExpenses();
    } catch (err) { console.error("Add:", err); }
  });

  // Edit save
  document.getElementById("editExpenseForm").addEventListener("submit", async e => {
    e.preventDefault();
    const id = document.getElementById("editId").value;
    const body = {
      title:    document.getElementById("editTitle").value.trim(),
      amount:   document.getElementById("editAmount").value,
      category: editCategoryDD.getValue(),      // ← custom dropdown
      date:     document.getElementById("editDate").value,
    };
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      closeEditModal();
      loadExpenses();
    } catch (err) { console.error("Edit:", err); }
  });
}

/* ─────────────────────────────────────
   Edit Modal
───────────────────────────────────── */
function openEditModal(id, title, amount, category, date) {
  document.getElementById("editId").value    = id;
  document.getElementById("editTitle").value = title;
  document.getElementById("editAmount").value = amount;
  editCategoryDD.setValue(category);           // ← custom dropdown
  editPicker.setDate(date, false);
  document.getElementById("editModalOverlay").classList.add("open");
}

function closeEditModal() {
  document.getElementById("editModalOverlay").classList.remove("open");
}

/* ─────────────────────────────────────
   Delete Modal
───────────────────────────────────── */
function openDeleteModal(id, title) {
  document.getElementById("deleteId").value         = id;
  document.getElementById("deleteExpName").textContent = title;
  document.getElementById("deleteModalOverlay").classList.add("open");
}

function closeDeleteModal() {
  document.getElementById("deleteModalOverlay").classList.remove("open");
}

async function confirmDeleteExpense() {
  const id = document.getElementById("deleteId").value;
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    closeDeleteModal();
    loadExpenses();
  } catch (err) { console.error("Delete:", err); }
}

/* Click outside modal to close */
function handleOverlayClick(event, overlayId) {
  if (event.target.id === overlayId) {
    document.getElementById(overlayId).classList.remove("open");
  }
}

/* ─────────────────────────────────────
   Filter
───────────────────────────────────── */
function filterExpenses() {
  const from = document.getElementById("fromDate").value;
  const to   = document.getElementById("toDate").value;
  if (!from || !to) {
    alert("Please select both From and To dates.");
    return;
  }
  loadExpenses({ from, to });
}

function clearFilters() {
  fromPicker.clear();
  toPicker.clear();
  fromPicker.set("maxDate", null);
  toPicker.set("minDate", null);
  loadExpenses();
}

/* ─────────────────────────────────────
   Export CSV
───────────────────────────────────── */
async function exportToCSV() {
  const data = await fetch(API_URL).then(r => r.json());
  if (!data.length) { alert("No expenses to export."); return; }

  const rows = [
    ["Title","Amount (₹)","Category","Date"],
    ...data.map(e => [
      `"${e.title.replace(/"/g,'""')}"`,
      e.amount,
      e.category,
      e.date,
    ]),
  ];

  const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), {
    href: url,
    download: `expenses_${new Date().toISOString().slice(0,10)}.csv`,
  });
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────
   Utilities
───────────────────────────────────── */
function showSpinner(visible) {
  document.getElementById("loadingSpinner").style.display = visible ? "flex" : "none";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d} ${months[+m-1]} ${y}`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

function escAttr(str) {
  return String(str).replace(/'/g, "\\'");
}
