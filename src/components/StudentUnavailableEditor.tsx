import React, { useState } from "react";

interface StudentUnavailableEditorProps {
  value: string[]; // yyyy-mm-dd 陣列
  onChange: (dates: string[]) => void;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function StudentUnavailableEditor({
  value,
  onChange,
}: StudentUnavailableEditorProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-based
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  // 產生該月所有日期
  const days = Array.from(
    { length: getDaysInMonth(year, month) },
    (_, i) => i + 1
  );

  // 目前這個月的已選日期
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthDates = value.filter((d) => d.startsWith(monthPrefix));

  function toggleDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    let newDates: string[];
    if (monthDates.includes(dateStr)) {
      newDates = value.filter((d) => d !== dateStr);
    } else {
      newDates = [...value, dateStr];
    }
    onChange(newDates);
  }

  function handleMonthChange(offset: number) {
    let newMonth = month + offset;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center mb-2 justify-center">
        <button
          type="button"
          className="px-2 py-1 text-xs bg-gray-800 text-gray-200 font-bold rounded-full hover:bg-gray-700 border border-gray-700 shadow-sm transition"
          onClick={() => handleMonthChange(-1)}
        >
          &lt;
        </button>
        <span className="text-base text-gray-100 font-bold px-2">
          {year}年{month + 1}月
        </span>
        <button
          type="button"
          className="px-2 py-1 text-xs bg-gray-800 text-gray-200 font-bold rounded-full hover:bg-gray-700 border border-gray-700 shadow-sm transition"
          onClick={() => handleMonthChange(1)}
        >
          &gt;
        </button>
      </div>
      <div className="overflow-x-auto flex justify-center">
        <div className="inline-block">
          <div className="grid grid-cols-7 gap-x-3 gap-y-3 bg-gray-900 rounded-lg p-2 shadow border border-gray-800">
            {["日", "一", "二", "三", "四", "五", "六"].map((w, i) => (
              <div
                key={w}
                className="text-center text-xs font-bold text-gray-400 pb-1"
              >
                {w}
              </div>
            ))}
            {Array(new Date(year, month, 1).getDay())
              .fill(null)
              .map((_, i) => (
                <div key={"empty-" + i}></div>
              ))}
            {days.map((day) => {
              const dateStr = `${year}-${String(month + 1).padStart(
                2,
                "0"
              )}-${String(day).padStart(2, "0")}`;
              const selected = monthDates.includes(dateStr);
              return (
                <button
                  key={day}
                  type="button"
                  className={`rounded w-12 h-12 text-base font-semibold border transition duration-100 ${
                    selected
                      ? "bg-red-600 text-white border-red-700 shadow"
                      : "bg-gray-800 text-gray-200 border-gray-700 hover:bg-red-700 hover:text-white"
                  }`}
                  onClick={() => toggleDay(day)}
                  style={{ aspectRatio: "1 / 1", minWidth: 36, minHeight: 36 }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-2 justify-center">
        {monthDates.length > 0 && (
          <span className="text-xs text-red-300 bg-gray-800 rounded px-2 py-1 border border-red-700">
            本月不可上課日：{monthDates.map((d) => d.split("-")[2]).join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}
