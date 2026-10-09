"use client";

// A submit button that asks "are you sure?" first.
export default function ConfirmSubmit({ message, className, children, label }) {
  return (
    <button
      type="submit"
      className={className}
      aria-label={label}
      onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}
    >
      {children}
    </button>
  );
}
