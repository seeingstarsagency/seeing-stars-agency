"use client";

import { useFormStatus } from "react-dom";

// A submit button that disables itself while the form is sending, so a double click
// can't send two invitations (the second one cancels the link in the first).
export default function PendingSubmit({ className, style, children, pendingText = "Sending…" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} style={style} disabled={pending} aria-busy={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
