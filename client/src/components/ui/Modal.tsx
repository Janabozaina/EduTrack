import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

export default function Modal({
  open,
  title,
  children,
  onClose,
  size = "md",
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className={`w-full ${sizes[size]} rounded-3xl bg-white shadow-2xl max-h-[calc(100vh-4rem)] overflow-auto`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 md:px-6">
          <h2 className="text-xl font-bold">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-slate-100"
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}