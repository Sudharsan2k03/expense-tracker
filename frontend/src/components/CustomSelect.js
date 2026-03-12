import React, { useState, useEffect, useRef } from "react";

const CATEGORY_OPTIONS = [
  { value: "Food", label: "Food", icon: "🍔" },
  { value: "Transport", label: "Transport", icon: "🚕" },
  { value: "Shopping", label: "Shopping", icon: "🛍️" },
  { value: "Entertainment", label: "Entertainment", icon: "🍿" },
  { value: "Bills", label: "Bills", icon: "📄" },
  { value: "Others", label: "Others", icon: "📦" },
];

function CustomSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const optionsRef = useRef(null);
  const triggerRef = useRef(null);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSelect = (e, val) => {
    e.stopPropagation();
    onChange(val);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current && optionsRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      optionsRef.current.style.top = `${rect.bottom + 4}px`;
      optionsRef.current.style.left = `${rect.left}px`;
      optionsRef.current.style.width = `${rect.width}px`;
    }
  }, [isOpen]);

  const selectedOption = CATEGORY_OPTIONS.find((opt) => opt.value === value) || CATEGORY_OPTIONS[0];

  return (
    <div className={`custom-select ${isOpen ? "open" : ""}`} ref={containerRef}>
      <button
        type="button"
        className="cs-trigger"
        onClick={toggleDropdown}
        ref={triggerRef}
      >
        <span className="cs-label">
          {selectedOption.icon} {selectedOption.label}
        </span>
        <span className="cs-arrow">▾</span>
      </button>
      <ul className="cs-options" ref={optionsRef}>
        {CATEGORY_OPTIONS.map((opt) => (
          <li
            key={opt.value}
            className={`cs-option ${opt.value === value ? "selected" : ""}`}
            onClick={(e) => handleSelect(e, opt.value)}
          >
            {opt.icon} {opt.label}
          </li>
        ))}
      </ul>
    </div>
  );
}


export default CustomSelect;
