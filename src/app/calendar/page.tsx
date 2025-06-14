// 行事曆主頁，與原本 page.tsx 相同，請將原本 src/app/page.tsx 內容搬移到這裡

"use client";
import React, { useEffect, useState, useMemo } from "react";
import CalendarView from "../../components/CalendarView";

// 型別最佳化
interface LessonEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  coach_id: string;
  student_id: string;
}

export default function HomePage() {
  const [coaches, setCoaches] = useState<{ id: string; name: string }[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [events, setEvents] = useState<LessonEvent[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  // 將 month 改為 currentTime
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // 取得課程資料（只撈當月）
  const fetchLessons = () => {
    setLoading(true);
    const year = currentTime.getFullYear();
    const month = currentTime.getMonth() + 1;
    fetch(`/api/lessons?year=${year}&month=${month}`)
      .then((res) => res.json())
      .then((lessons) => {
        const studentMap = new Map<string, string>();
        students.forEach((s) => studentMap.set(s.id, s.name));
        const coachMap = new Map<string, string>();
        coaches.forEach((c) => coachMap.set(c.id, c.name));
        // 將 lessons 明確型別
        const mapped: LessonEvent[] = (
          lessons as Array<{
            id: string;
            coach_id: string;
            student_id: string;
            start_time: string;
            end_time: string;
          }>
        ).map((lesson) => ({
          id: lesson.id,
          title: `教練:${
            coachMap.get(lesson.coach_id) ?? lesson.coach_id
          } 學生:${studentMap.get(lesson.student_id) ?? lesson.student_id}`,
          start: new Date(lesson.start_time).toISOString(),
          end: new Date(lesson.end_time).toISOString(),
          coach_id: lesson.coach_id,
          student_id: lesson.student_id,
        }));
        setEvents(mapped);
        // 新增/編輯課程後自動清空篩選
        setSelectedCoach("");
        setSelectedStudent("");
      })
      .finally(() => setLoading(false));
  };

  // 只在 mount 時撈 students/coaches
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/students").then((res) => res.json()),
      fetch("/api/coaches").then((res) => res.json()),
    ])
      .then(([students, coaches]) => {
        setStudents(students);
        setCoaches(coaches);
        fetchLessons();
      })
      .finally(() => setLoading(false));
  }, []);

  // 只依賴 currentTime，students/coaches 取得後才會觸發
  useEffect(() => {
    if (coaches.length && students.length) fetchLessons();
    // eslint-disable-next-line
  }, [currentTime]);

  // 篩選後的課程
  const filteredEvents = useMemo(
    () =>
      events.filter((e) => {
        let match = true;
        if (selectedCoach) match = e.coach_id === selectedCoach;
        if (selectedStudent) match = match && e.student_id === selectedStudent;
        return match;
      }),
    [events, selectedCoach, selectedStudent]
  );

  // useMemo 避免 CalendarView props reference 每次都變動
  const memoizedCoaches = useMemo(() => coaches, [coaches]);
  const memoizedStudents = useMemo(() => students, [students]);

  // 新增：全域月份切換元件
  function handleMonthChange(offset: number) {
    setCurrentTime((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + offset);
      return d;
    });
  }
  const month = {
    year: currentTime.getFullYear(),
    month: currentTime.getMonth(),
  };

  return (
    <div className="min-h-screen bg-black p-1 pb-20 gap-16  font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-4xl mx-auto">
        {/* 全域月份切換 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">課程行事曆</h1>
          <MonthNav month={month} onChange={handleMonthChange} />
        </div>
        {/* Skeleton loading */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-12 bg-gray-800 rounded mb-4" />
            <div className="h-8 bg-gray-800 rounded w-1/2 mb-2" />
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-2" />
            <div className="h-32 bg-gray-900 rounded-xl border border-gray-700" />
            <div className="h-96 bg-gray-900 rounded-xl border border-gray-700" />
          </div>
        ) : (
          <>
            {/* 統計與未排課區塊 */}
            <UnassignedStudents
              students={students}
              events={events}
              currentTime={currentTime}
              setCurrentTime={setCurrentTime}
              // 不再傳遞 MonthNav，僅顯示月份
            />
            <LessonStats
              events={events}
              coaches={coaches}
              students={students}
              currentTime={currentTime}
            />
            {/* 篩選器 */}
            <div className="flex flex-col gap-2 mb-4 p-4 bg-gray-900 border border-gray-700 rounded">
              <div className="font-bold text-gray-200 mb-1">課程篩選</div>
              <div className="flex gap-4">
                <select
                  className="border rounded p-2 bg-black text-white border-gray-700"
                  value={selectedCoach}
                  onChange={(e) => setSelectedCoach(e.target.value)}
                >
                  <option value="">全部教練</option>
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  className="border rounded p-2 bg-black text-white border-gray-700"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">全部學生</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-xl p-2">
              <CalendarView
                coaches={memoizedCoaches}
                students={memoizedStudents}
                events={filteredEvents}
                onEventsChange={fetchLessons}
                studentId={selectedStudent}
                onStudentChange={setSelectedStudent}
                currentTime={currentTime}
                onCurrentTimeChange={setCurrentTime}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// UnassignedStudents 支援 currentTime/state
function UnassignedStudents({
  students,
  events,
  currentTime,
  setCurrentTime,
}: {
  students: { id: string; name: string }[];
  events: LessonEvent[];
  currentTime: Date;
  setCurrentTime: React.Dispatch<React.SetStateAction<Date>>;
}) {
  const month = {
    year: currentTime.getFullYear(),
    month: currentTime.getMonth(),
  };
  const monthStart = new Date(month.year, month.month, 1);
  const monthEnd = new Date(month.year, month.month + 1, 0, 23, 59, 59);
  const assignedStudentIds = new Set(
    events
      .filter((e) => {
        const start = new Date(e.start);
        return start >= monthStart && start <= monthEnd;
      })
      .map((e) => e.student_id)
  );
  const unassigned = students.filter((s) => !assignedStudentIds.has(s.id));
  if (unassigned.length === 0)
    return (
      <div className="mb-4 p-2 bg-yellow-50 border border-yellow-300 rounded flex items-center justify-between">
        <div className="font-bold text-yellow-800">
          {month.year}年{month.month + 1}月所有學生皆有排課
        </div>
      </div>
    );
  return (
    <div className="mb-4 p-2 bg-yellow-50 border border-yellow-300 rounded">
      <div className="flex items-center justify-between mb-1">
        <div className="font-bold text-yellow-800">
          {month.year}年{month.month + 1}月尚未排課學生：
        </div>
      </div>
      <div className="max-h-40 overflow-y-auto border border-yellow-200 rounded bg-yellow-100/60">
        <ul className="list-disc pl-5 text-yellow-900 text-sm">
          {unassigned.map((s) => (
            <li key={s.id}>{s.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MonthNav({
  month,
  onChange,
}: {
  month: { year: number; month: number };
  onChange: (offset: number) => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      <button
        className="px-2 py-1 text-xs bg-gray-700 text-white font-bold rounded hover:bg-blue-600 border border-gray-500 shadow-sm transition"
        onClick={() => onChange(-1)}
      >
        &lt;
      </button>
      <span className="text-base text-white font-bold">
        {month.year}年{month.month + 1}月
      </span>
      <button
        className="px-2 py-1 text-xs bg-gray-700 text-white font-bold rounded hover:bg-blue-600 border border-gray-500 shadow-sm transition"
        onClick={() => onChange(1)}
      >
        &gt;
      </button>
    </div>
  );
}

// LessonStats 支援 currentTime
function LessonStats({
  events,
  coaches,
  students,
  currentTime,
}: {
  events: LessonEvent[];
  coaches: { id: string; name: string }[];
  students: { id: string; name: string }[];
  currentTime: Date;
}) {
  const month = {
    year: currentTime.getFullYear(),
    month: currentTime.getMonth(),
  };
  const monthStart = new Date(month.year, month.month, 1);
  const monthEnd = new Date(month.year, month.month + 1, 0, 23, 59, 59);
  // 教練統計
  const coachCount = new Map<string, number>();
  // 學生統計
  const studentCount = new Map<string, number>();
  events.forEach((e) => {
    const start = new Date(e.start);
    if (start >= monthStart && start <= monthEnd) {
      coachCount.set(e.coach_id, (coachCount.get(e.coach_id) || 0) + 1);
      studentCount.set(e.student_id, (studentCount.get(e.student_id) || 0) + 1);
    }
  });
  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gray-800 border border-gray-600 rounded p-3">
        <div className="font-bold text-gray-200 mb-2">本月教練排課數</div>
        <ul className="text-gray-100 text-sm space-y-1">
          {coaches.map((c) => (
            <li key={c.id}>
              {c.name}：{coachCount.get(c.id) || 0} 堂
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-gray-800 border border-gray-600 rounded p-3">
        <div className="font-bold text-gray-200 mb-2">本月學生排課數</div>
        <ul className="text-gray-100 text-sm space-y-1">
          {students.map((s) => (
            <li key={s.id}>
              {s.name}：{studentCount.get(s.id) || 0} 堂
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
