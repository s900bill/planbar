"use client";
import React, { useEffect, useState } from "react";
import Dialog from "@/components/Dialog";
import { HiPencil, HiTrash } from "react-icons/hi2";

interface Coach {
  id: string;
  name: string;
  notes?: string;
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [form, setForm] = useState({ id: "", name: "", notes: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 取得教練列表
  const fetchCoaches = () => {
    setLoading(true);
    fetch("/api/coaches")
      .then((res) => res.json())
      .then(setCoaches)
      .catch(() => setError("載入失敗，請稍後再試"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  // 新增或更新教練
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editId) {
        await fetch(`/api/coaches/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, notes: form.notes }),
        });
      } else {
        await fetch("/api/coaches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, notes: form.notes }),
        });
      }
      setForm({ id: "", name: "", notes: "" });
      setEditId(null);
      fetchCoaches();
    } catch {
      setError("儲存失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  // 編輯教練
  const handleEdit = (coach: Coach) => {
    setForm({ id: coach.id, name: coach.name, notes: coach.notes || "" });
    setEditId(coach.id);
  };

  // 刪除教練（彈窗確認）
  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    setError("");
    try {
      await fetch(`/api/coaches/${deleteId}`, { method: "DELETE" });
      fetchCoaches();
    } catch {
      setError("刪除失敗，請稍後再試");
    } finally {
      setDeleteId(null);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 sm:p-10 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-4xl mx-auto grid gap-8">
        <h1 className="text-3xl font-bold text-white mb-2">教練管理</h1>
        <div className="bg-gray-900 rounded-xl shadow p-6 mb-4 border border-gray-700">
          <form
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
            onSubmit={handleSubmit}
          >
            <div>
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
            <div>
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
            <div className="flex gap-2">
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
                    setForm({ id: "", name: "", notes: "" });
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
          <h2 className="text-xl font-semibold text-gray-200 mb-4">教練列表</h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {coaches.length === 0 ? (
                <div className="text-gray-500 col-span-full text-center">
                  尚無教練資料
                </div>
              ) : (
                coaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="group bg-black border border-gray-700 rounded-lg p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-white text-lg truncate">
                        {coach.name}
                      </div>
                      <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition">
                        <button
                          className="p-1 rounded hover:bg-blue-900 text-blue-400"
                          title="編輯"
                          onClick={() => handleEdit(coach)}
                          disabled={loading}
                        >
                          <HiPencil size={20} />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-red-900 text-red-400"
                          title="刪除"
                          onClick={() => setDeleteId(coach.id)}
                          disabled={loading}
                        >
                          <HiTrash size={20} />
                        </button>
                      </div>
                    </div>
                    {coach.notes && (
                      <div className="text-gray-400 text-sm truncate">
                        {coach.notes}
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
        title="刪除教練"
        description="確定要刪除此教練嗎？此動作無法復原。"
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
    </div>
  );
}
