"use client";
import React, { useEffect, useState } from "react";
import Dialog from "@/components/Dialog";
import { HiPencil, HiTrash } from "react-icons/hi2";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import StudentUnavailableEditor from "@/components/StudentUnavailableEditor";

interface Student {
  id: string;
  name: string;
  phone: string;
  member_id: string;
  notes?: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    phone: "",
    member_id: "",
    notes: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [unavailableEditStudent, setUnavailableEditStudent] =
    useState<Student | null>(null);
  const [unavailableEditDates, setUnavailableEditDates] = useState<string[]>(
    []
  );
  const [unavailableEditLoading, setUnavailableEditLoading] = useState(false);
  const [unavailableEditError, setUnavailableEditError] = useState("");

  // 取得學生列表
  const fetchStudents = () => {
    setLoading(true);
    fetch("/api/students")
      .then((res) => res.json())
      .then(setStudents)
      .catch(() => setError("載入失敗，請稍後再試"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 新增或更新學生
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editId) {
        await fetch(`/api/students/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            member_id: form.member_id,
            notes: form.notes,
          }),
        });
        // 更新不可上課日
        await fetch(`/api/student-unavailable-times`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: editId, dates: unavailableDates }),
        });
      } else {
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            member_id: form.member_id,
            notes: form.notes,
          }),
        });
        const student = await res.json();
        // 新增不可上課日
        if (student.id) {
          await fetch(`/api/student-unavailable-times`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_id: student.id,
              dates: unavailableDates,
            }),
          });
        }
      }
      setForm({ id: "", name: "", phone: "", member_id: "", notes: "" });
      setUnavailableDates([]);
      setEditId(null);
      fetchStudents();
    } catch {
      setError("儲存失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  // 編輯學生
  const handleEdit = (student: Student) => {
    setForm({
      id: student.id,
      name: student.name,
      phone: student.phone,
      member_id: student.member_id,
      notes: student.notes || "",
    });
    console.log(student.id);
    setEditId(student.id);
    // 取得不可上課日
    fetch(`/api/student-unavailable-times?student_id=${student.id}`)
      .then((res) => res.json())
      .then((list) =>
        setUnavailableDates(list.map((d: any) => d.date.slice(0, 10)))
      )
      .catch(() => setUnavailableDates([]));
  };

  // 刪除學生（彈窗確認）
  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    setError("");
    try {
      await fetch(`/api/students/${deleteId}`, { method: "DELETE" });
      fetchStudents();
    } catch {
      setError("刪除失敗，請稍後再試");
    } finally {
      setDeleteId(null);
      setLoading(false);
    }
  };

  // 編輯不可上課日（打開 Dialog 並 fetch 該學生的日期）
  const handleUnavailableEdit = (student: Student) => {
    setUnavailableEditStudent(student);
    setUnavailableEditLoading(true);
    setUnavailableEditError("");
    fetch(`/api/student-unavailable-times?student_id=${student.id}`)
      .then((res) => res.json())
      .then((list) =>
        setUnavailableEditDates(list.map((d: any) => d.date.slice(0, 10)))
      )
      .catch(() => setUnavailableEditDates([]))
      .finally(() => setUnavailableEditLoading(false));
  };

  // 儲存不可上課日
  const handleUnavailableSave = async () => {
    if (!unavailableEditStudent) return;
    setUnavailableEditLoading(true);
    setUnavailableEditError("");
    try {
      await fetch(`/api/student-unavailable-times`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: unavailableEditStudent.id,
          dates: unavailableEditDates,
        }),
      });
      setUnavailableEditStudent(null);
      fetchStudents();
    } catch {
      setUnavailableEditError("儲存失敗，請稍後再試");
    } finally {
      setUnavailableEditLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 sm:p-10 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-4xl mx-auto grid gap-8">
        <h1 className="text-3xl font-bold text-white mb-2">學生管理</h1>
        <div className="bg-gray-900 rounded-xl shadow p-6 mb-4 border border-gray-700">
          <form
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-start"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <label className="block text-gray-200 mb-1">姓名</label>
              <input
                className="border border-gray-700 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 bg-black text-white placeholder-gray-500"
                placeholder="請輸入姓名"
                value={form.name}
                required
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-gray-200 mb-1">電話</label>
              <input
                className="border border-gray-700 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 bg-black text-white placeholder-gray-500"
                placeholder="電話"
                value={form.phone}
                required
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-gray-200 mb-1">會員編號</label>
              <input
                className="border border-gray-700 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 bg-black text-white placeholder-gray-500"
                placeholder="會員編號"
                value={form.member_id}
                required
                onChange={(e) =>
                  setForm((f) => ({ ...f, member_id: e.target.value }))
                }
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-gray-200 mb-1">備註</label>
              <input
                className="border border-gray-700 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 bg-black text-white placeholder-gray-500"
                placeholder="備註（選填）"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                disabled={loading}
              />
            </div>

            {editId && (
              <div className="col-span-full  mt-2">
                <label className="block text-gray-200 mb-1">不可上課日</label>
                <StudentUnavailableEditor
                  value={unavailableDates}
                  onChange={setUnavailableDates}
                />
              </div>
            )}

            <div className="flex gap-2 col-span-full mt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold flex-1 transition border border-blue-800"
                disabled={loading}
              >
                {editId ? "更新" : "新增"}
              </button>
              {editId && (
                <button
                  type="button"
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg px-4 py-2 font-semibold flex-1 transition border border-gray-600"
                  onClick={() => {
                    setForm({
                      id: "",
                      name: "",
                      phone: "",
                      member_id: "",
                      notes: "",
                    });
                    setEditId(null);
                  }}
                  disabled={loading}
                >
                  取消
                </button>
              )}
            </div>
          </form>
          {error && <div className="text-red-400 mt-2">{error}</div>}
        </div>
        <div className="bg-gray-900 rounded-xl shadow p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">學生列表</h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {students.length === 0 ? (
                <div className="text-gray-500 col-span-full text-center">
                  尚無學生資料
                </div>
              ) : (
                students.map((student) => (
                  <div
                    key={student.id}
                    className="group bg-black border border-gray-700 rounded-lg p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-white text-lg truncate">
                        {student.name}
                      </div>
                      <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition">
                        <button
                          className="p-1 rounded hover:bg-blue-900 text-blue-400"
                          title="編輯"
                          onClick={() => handleEdit(student)}
                          disabled={loading}
                        >
                          <HiPencil size={20} />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-red-900 text-red-400"
                          title="刪除"
                          onClick={() => setDeleteId(student.id)}
                          disabled={loading}
                        >
                          <HiTrash size={20} />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-yellow-900 text-yellow-400"
                          title="編輯不可上課日"
                          onClick={() => handleUnavailableEdit(student)}
                          disabled={loading}
                        >
                          <HiOutlineCalendarDays size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm truncate">
                      電話：{student.phone}
                    </div>
                    <div className="text-gray-400 text-sm truncate">
                      會員編號：{student.member_id}
                    </div>
                    {student.notes && (
                      <div className="text-gray-500 text-xs truncate">
                        {student.notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <Dialog
        open={!!deleteId}
        title="刪除學生"
        description="確定要刪除此學生嗎？此動作無法復原。"
        onClose={() => setDeleteId(null)}
        actions={[
          <button
            key="cancel"
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold border border-gray-600"
            onClick={() => setDeleteId(null)}
            disabled={loading}
          >
            取消
          </button>,
          <button
            key="delete"
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold border border-red-800"
            onClick={handleDelete}
            disabled={loading}
          >
            刪除
          </button>,
        ]}
      />
      <Dialog
        open={!!unavailableEditStudent}
        title={
          unavailableEditStudent
            ? `編輯 ${unavailableEditStudent.name} 的不可上課日`
            : ""
        }
        description="設定學生不可排課的日期，這些日期將會在行事曆標示且禁止排課。"
        onClose={() => setUnavailableEditStudent(null)}
        actions={[
          <button
            key="cancel"
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold border border-gray-600"
            onClick={() => setUnavailableEditStudent(null)}
            disabled={unavailableEditLoading}
          >
            取消
          </button>,
          <button
            key="save"
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold border border-blue-800"
            onClick={handleUnavailableSave}
            disabled={unavailableEditLoading}
          >
            儲存
          </button>,
        ]}
      >
        <div className="my-4">
          {unavailableEditLoading ? (
            <div className="text-gray-400">載入中...</div>
          ) : (
            <StudentUnavailableEditor
              value={unavailableEditDates}
              onChange={setUnavailableEditDates}
            />
          )}
          {unavailableEditError && (
            <div className="text-red-400 mt-2">{unavailableEditError}</div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
