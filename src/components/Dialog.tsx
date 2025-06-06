"use client";
import React from "react";

interface DialogProps {
  open: boolean;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onClose: () => void;
  actions?: React.ReactNode;
}

export default function Dialog({
  open,
  title,
  description,
  children,
  onClose,
  actions,
}: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white text-black rounded-lg shadow-lg max-w-sm w-full p-6 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="關閉"
        >
          ×
        </button>
        {title && <h2 className="text-lg font-bold mb-2">{title}</h2>}
        {description && <div className="mb-4 text-gray-700">{description}</div>}
        {children}
        {actions && (
          <div className="mt-4 flex gap-2 justify-end">{actions}</div>
        )}
      </div>
    </div>
  );
}
