import React from "react";

interface CalendarDateTimePickerProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  inputClassName?: string;
}

export default function CalendarDateTimePicker({
  value,
  onChange,
  label,
  inputClassName,
}: CalendarDateTimePickerProps) {
  return (
    <div className="flex flex-col flex-1">
      {label && <label className="text-xs text-gray-400 mb-1">{label}</label>}
      <input
        type="datetime-local"
        className={`border rounded p-2 ${
          inputClassName ?? "bg-black text-white border-gray-600"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}
