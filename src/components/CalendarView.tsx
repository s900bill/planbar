"use client";
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Dialog from "./Dialog";
import { apiRequest } from "../services/apiService";
import CalendarDateTimePicker from "../components/CalendarDateTimePicker";

// 定義 Lesson 型別
interface Lesson {
  id: string;
  coach_id: string;
  student_id: string;
  start_time: string;
  end_time: string;
}

interface LessonEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  coach_id: string;
  student_id: string;
}

interface CalendarViewProps {
  coaches: { id: string; name: string }[];
  students: { id: string; name: string }[];
  events: LessonEvent[];
  onEventsChange: () => void;
}

// 工具函式：local datetime string 轉 UTC ISO string
function toUTCISOString(local: string) {
  // local: '2025-06-06T20:00'
  if (!local) return "";
  const d = new Date(local);
  return d.toISOString();
}

// 工具函式：Date 轉 datetime-local 格式
function toDateTimeLocalString(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// 取得單一課程
async function fetchLesson(id: string): Promise<Lesson> {
  const { data, error } = await apiRequest<Lesson>(`/api/lessons/${id}`);
  if (error || !data) throw new Error(error || "找不到課程");
  return data;
}

// 新增課程
async function createLessonApi(data: Omit<Lesson, "id">) {
  const res = await apiRequest<Lesson>("/api/lessons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.error) throw new Error(res.error);
  return res.data;
}

// 更新課程
async function updateLessonApi(id: string, data: Partial<Lesson>) {
  const res = await apiRequest<Lesson>(`/api/lessons/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.error) throw new Error(res.error);
  return res.data;
}

// 刪除課程
async function deleteLessonApi(id: string) {
  const res = await apiRequest(`/api/lessons/${id}`, { method: "DELETE" });
  if (res.error) throw new Error(res.error);
  return res.data;
}

export default function CalendarView({
  coaches,
  students,
  events,
  onEventsChange,
}: CalendarViewProps) {
  console.log("CalendarView events", events);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    coach_id: "",
    student_id: "",
    start_time: "",
    end_time: "",
  });
  const [editId, setEditId] = useState<string | null>(null);

  // Dialog 狀態
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"edit" | "delete" | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // 顯示課程詳細資訊的 Dialog 狀態
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoEvent, setInfoEvent] = useState<LessonEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [calendarHeight, setCalendarHeight] = useState(650);
  const [aspectRatio, setAspectRatio] = useState(1.35);
  const [maxEvents, setMaxEvents] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCalendarHeight(400); // 手機用固定數字
        setAspectRatio(0.7);
        setMaxEvents(2);
      } else {
        setCalendarHeight(650);
        setAspectRatio(1.35);
        setMaxEvents(4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleEdit = async (lessonId: string) => {
    setLoading(true);
    try {
      const lesson = await fetchLesson(lessonId);
      setFormData({
        coach_id: lesson.coach_id || "",
        student_id: lesson.student_id || "",
        start_time: toDateTimeLocalString(lesson.start_time),
        end_time: toDateTimeLocalString(lesson.end_time),
      });
      setEditId(lessonId);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 驗證結束時間 > 開始時間
    if (!formData.start_time || !formData.end_time) {
      alert("請選擇開始與結束時間");
      return;
    }
    const start = new Date(formData.start_time);
    const end = new Date(formData.end_time);
    if (end <= start) {
      alert("結束時間必須大於開始時間");
      return;
    }
    // 驗證教練/學生時段衝突
    const overlap = events.some((e) => {
      if (editId && e.id === editId) return false; // 編輯時排除自己
      // 檢查教練或學生有重疊
      const eStart = new Date(e.start);
      const eEnd = new Date(e.end);
      const sameCoach = e.coach_id === formData.coach_id;
      const sameStudent = e.student_id === formData.student_id;
      // 時段重疊
      const isOverlap = start < eEnd && end > eStart;
      return (sameCoach || sameStudent) && isOverlap;
    });
    if (overlap) {
      alert("教練或學生在該時段已有其他課程，請選擇不重疊的時間");
      return;
    }
    setLoading(true);
    try {
      const data = {
        ...formData,
        start_time: toUTCISOString(formData.start_time),
        end_time: toUTCISOString(formData.end_time),
      };
      if (editId) {
        await updateLessonApi(editId, data);
      } else {
        await createLessonApi(data);
      }
      setShowForm(false);
      setEditId(null);
      setFormData({
        coach_id: "",
        student_id: "",
        start_time: "",
        end_time: "",
      });
      onEventsChange();
    } finally {
      setLoading(false);
    }
  };

  // FullCalendar 拉一段時間時自動開啟表單並帶入時間
  function handleSelect(arg: { start: Date; end: Date }) {
    setFormData((f) => ({
      ...f,
      start_time: toDateTimeLocalString(arg.start),
      end_time: toDateTimeLocalString(arg.end),
    }));
    setEditId(null);
    setShowForm(true);
  }

  // FullCalendar 某時段點兩下自動帶入開始時間，結束時間+1小時
  function handleDateClick(arg: { date: Date; jsEvent: MouseEvent }) {
    if (arg.jsEvent && arg.jsEvent.detail === 2) {
      const start = arg.date;
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      setFormData((f) => ({
        ...f,
        start_time: toDateTimeLocalString(start),
        end_time: toDateTimeLocalString(end),
      }));
      setEditId(null);
      setShowForm(true);
    } else {
      setFormData((f) => ({
        ...f,
        start_time: toDateTimeLocalString(arg.date),
        end_time: "",
      }));
      setEditId(null);
      setShowForm(true);
    }
  }

  // 取得課程詳細資訊
  function getEventDetail(eventId: string) {
    return events.find((e) => e.id === eventId) || null;
  }

  // 取得教練/學生名稱
  function getCoachName(id: string) {
    return coaches.find((c) => c.id === id)?.name || id;
  }
  function getStudentName(id: string) {
    return students.find((s) => s.id === id)?.name || id;
  }

  return (
    <div className="max-w-4xl mx-auto bg-black text-white rounded-lg shadow p-4">
      <h1 className="text-2xl font-bold mb-4 text-center text-white">
        健身課程行事曆
      </h1>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setShowForm(true)}
      >
        新增課程
      </button>
      {showForm && (
        <form className="mb-4 flex flex-col gap-2" onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <select
              className="border rounded p-2 flex-1 bg-black text-white border-gray-600"
              required
              value={formData.coach_id}
              onChange={(e) =>
                setFormData((f) => ({ ...f, coach_id: e.target.value }))
              }
            >
              <option value="">選擇教練</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="border rounded p-2 flex-1 bg-black text-white border-gray-600"
              required
              value={formData.student_id}
              onChange={(e) =>
                setFormData((f) => ({ ...f, student_id: e.target.value }))
              }
            >
              <option value="">選擇學生</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <CalendarDateTimePicker
              value={formData.start_time}
              onChange={(val: string) =>
                setFormData((f) => ({ ...f, start_time: val }))
              }
              label="開始時間"
              inputClassName="bg-white text-black border-gray-600 focus:ring-2 focus:ring-blue-400"
            />
            <CalendarDateTimePicker
              value={formData.end_time}
              onChange={(val: string) =>
                setFormData((f) => ({ ...f, end_time: val }))
              }
              label="結束時間"
              inputClassName="bg-white text-black border-gray-600 focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 flex-1"
            >
              {editId ? "更新" : "儲存"}
            </button>
            <button
              type="button"
              className="bg-gray-300 text-black rounded px-4 py-2 flex-1"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
            >
              取消
            </button>
          </div>
        </form>
      )}
      <Dialog
        open={infoDialogOpen}
        title="課程詳細資訊"
        onClose={() => {
          setInfoDialogOpen(false);
          setInfoEvent(null);
        }}
        actions={
          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
              onClick={() => {
                if (infoEvent) handleEdit(infoEvent.id);
                setInfoDialogOpen(false);
                setInfoEvent(null);
              }}
            >
              編輯
            </button>
            <button
              className="bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700"
              onClick={() => {
                if (infoEvent) {
                  setSelectedEventId(infoEvent.id);
                  setDialogType("delete");
                  setDialogOpen(true);
                }
                setInfoDialogOpen(false);
                setInfoEvent(null);
              }}
            >
              刪除
            </button>
            <button
              className="bg-gray-300 text-black rounded px-4 py-2"
              onClick={() => setInfoDialogOpen(false)}
            >
              關閉
            </button>
          </div>
        }
      >
        {infoEvent && (
          <div className="text-base space-y-2">
            <div>
              <span className="font-bold">教練：</span>
              {getCoachName(infoEvent.coach_id)}
            </div>
            <div>
              <span className="font-bold">學生：</span>
              {getStudentName(infoEvent.student_id)}
            </div>
            <div>
              <span className="font-bold">開始：</span>
              {new Date(infoEvent.start).toLocaleString("zh-TW", {
                hour12: false,
              })}
            </div>
            <div>
              <span className="font-bold">結束：</span>
              {new Date(infoEvent.end).toLocaleString("zh-TW", {
                hour12: false,
              })}
            </div>
          </div>
        )}
      </Dialog>
      <Dialog
        open={dialogOpen}
        title={
          dialogType === "edit"
            ? "編輯課程"
            : dialogType === "delete"
            ? "刪除課程"
            : ""
        }
        description={
          dialogType === "edit"
            ? "你要編輯這筆課程嗎？"
            : dialogType === "delete"
            ? "確定要刪除此課程嗎？"
            : undefined
        }
        onClose={() => {
          setDialogOpen(false);
          setDialogType(null);
          setSelectedEventId(null);
        }}
        actions={
          dialogType === "edit" ? (
            <>
              <button
                className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
                onClick={() => {
                  if (selectedEventId) handleEdit(selectedEventId);
                  setDialogOpen(false);
                  setDialogType(null);
                  setSelectedEventId(null);
                }}
              >
                編輯
              </button>
              <button
                className="bg-gray-300 text-black rounded px-4 py-2"
                onClick={() => {
                  setDialogOpen(false);
                  setDialogType(null);
                  setSelectedEventId(null);
                }}
              >
                取消
              </button>
            </>
          ) : dialogType === "delete" ? (
            <>
              <button
                className="bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700"
                onClick={async () => {
                  if (selectedEventId) {
                    await deleteLessonApi(selectedEventId);
                    onEventsChange();
                  }
                  setDialogOpen(false);
                  setDialogType(null);
                  setSelectedEventId(null);
                }}
              >
                確定刪除
              </button>
              <button
                className="bg-gray-300 text-black rounded px-4 py-2"
                onClick={() => {
                  setDialogOpen(false);
                  setDialogType(null);
                  setSelectedEventId(null);
                }}
              >
                取消
              </button>
            </>
          ) : null
        }
      />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <style>{`
        /* 放大 FullCalendar 事件框與字體 */
        .fc-dark .fc-event {
          padding: 3px !important;
          border-radius: 8px !important;
          background: #2563eb !important;
          color: #fff !important;
          box-shadow: 0 2px 8px #0002;
          cursor: pointer;
        }
      
  
     
      `}</style>
      <div className="fc-dark">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale="zh-tw"
          selectable={true}
          select={handleSelect}
          slotEventOverlap={false}
          eventMaxStack={3}
          height={calendarHeight}
          aspectRatio={aspectRatio}
          dayMaxEvents={maxEvents}
          headerToolbar={{
            left: typeof window !== 'undefined' && window.innerWidth < 640 ? "prev,next today" : "prev,next today",
            center: typeof window !== 'undefined' && window.innerWidth < 640 ? "title" : "title",
            right:
              typeof window !== 'undefined' && window.innerWidth < 640
                ? "dayGridMonth,timeGridWeek"
                : "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          dayMaxEventRows={true}
          eventContent={(arg) => {
            return (
              <div className="truncate max-w-[110px] sm:max-w-[180px] text-xs sm:text-sm">
                <div className="fc-event-title font-bold truncate">
                  {arg.event.extendedProps.coachName} / {arg.event.extendedProps.studentName}
                </div>
                <div>
                  {new Date(arg.event.startStr).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false })}
                  -
                  {new Date(arg.event.endStr).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false })}
                </div>
              </div>
            );
          }}
          editable={true}
          dateClick={handleDateClick}
          eventDrop={async (info) => {
            setLoading(true);
            try {
              await updateLessonApi(info.event.id, {
                coach_id:
                  info.event.extendedProps.coach_id ||
                  info.event.extendedProps.coachId ||
                  info.event.extendedProps.coach_name ||
                  "",
                student_id:
                  info.event.extendedProps.student_id ||
                  info.event.extendedProps.studentId ||
                  info.event.extendedProps.student_name ||
                  "",
                start_time: info.event.start?.toISOString(),
                end_time: info.event.end?.toISOString(),
              });
              onEventsChange();
            } finally {
              setLoading(false);
            }
          }}
          eventResize={async (info) => {
            setLoading(true);
            try {
              await updateLessonApi(info.event.id, {
                coach_id:
                  info.event.extendedProps.coach_id ||
                  info.event.extendedProps.coachId ||
                  info.event.extendedProps.coach_name ||
                  "",
                student_id:
                  info.event.extendedProps.student_id ||
                  info.event.extendedProps.studentId ||
                  info.event.extendedProps.student_name ||
                  "",
                start_time: info.event.start?.toISOString(),
                end_time: info.event.end?.toISOString(),
              });
              onEventsChange();
            } finally {
              setLoading(false);
            }
          }}
          slotDuration="00:30:00"
          slotLabelInterval="01:00:00"
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          allDaySlot={false}
          eventClick={(info) => {
            setInfoEvent(getEventDetail(info.event.id));
            setInfoDialogOpen(true);
            info.jsEvent.preventDefault();
          }}
        />
      </div>
    </div>
  );
}
