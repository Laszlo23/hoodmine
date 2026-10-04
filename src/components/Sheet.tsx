import { useEffect, type ReactNode } from "react";
import type { FindKind } from "../world.ts";

export function Sheet({
  children,
  onClose,
  kind,
}: {
  children: ReactNode;
  onClose: () => void;
  kind?: FindKind;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="sheet-back" onClick={onClose} role="presentation">
      <div
        className="sheet"
        data-kind={kind}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grabber" />
        {children}
      </div>
    </div>
  );
}
