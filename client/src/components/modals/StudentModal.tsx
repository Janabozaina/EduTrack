import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Modal from "../ui/Modal";
import Input from "../ui/Input";
import { getClasses } from "../../services/class.service";
import { getGroups } from "../../services/group.service";
import {
  createStudent,
  updateStudent,
  getStudentAttendance,
} from "../../services/student.service";
import type { Student } from "../../types/student";

interface Props {
  open: boolean;
  mode: "add" | "edit" | "view";
  student?: Student | null;
  onClose: () => void;
  onSaved: () => void;
}

interface ClassItem {
  id: string;
  title: string;
}

interface GroupItem {
  id: string;
  name: string;
}

export default function StudentModal({
  open,
  mode,
  student: initialStudent,
  onClose,
  onSaved,
}: Props) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [student, setStudent] = useState({
    name: "",
    phone: "",
    parentPhone: "",
    monthlyFee: "",
    classId: "",
    groupId: "",
  });

  useEffect(() => {
    if (!open) return;

    loadClasses();

    if (initialStudent) {
  setStudent({
    name: initialStudent.name,
    phone: initialStudent.phone ?? "",
    parentPhone: initialStudent.parentPhone ?? "",
    monthlyFee: String(initialStudent.monthlyFee),
    classId: initialStudent.class.id,
    groupId: initialStudent.group.id,
  });

  loadGroups(initialStudent.class.id);

  if (mode === "view") {
    loadStudentAttendance(initialStudent.id);
  } else {
    setAttendances([]);
  }
} else {
  setStudent({
    name: "",
    phone: "",
    parentPhone: "",
    monthlyFee: "",
    classId: "",
    groupId: "",
  });

  setGroups([]);
  setAttendances([]);
}
  }, [open, initialStudent]);

  async function loadClasses() {
    try {
      const data = await getClasses();

      setClasses(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadGroups(classId: string) {
    if (!classId) {
      setGroups([]);
      return;
    }

    try {
      const data = await getGroups(classId);
      setGroups(data);
    } catch (error) {
      console.error(error);
    }
  }
  
  async function loadStudentAttendance(studentId: string) {
  setLoadingAttendance(true);

  try {
    const response = await getStudentAttendance(studentId);

    if (response.success) {
      setAttendances(response.data || []);
    } else {
      setAttendances([]);
    }
  } catch (error: any) {
    console.error("Load Attendance Error:", error);

    toast.error(
      error.response?.data?.message ||
        "Failed to load attendance history."
    );

    setAttendances([]);
  } finally {
    setLoadingAttendance(false);
  }
}

  async function handleClassChange(classId: string) {
    setStudent((prev) => ({
      ...prev,
      classId,
      groupId: "",
    }));

    await loadGroups(classId);
  }

  async function handleSave() {
    if (mode === "view") {
      onClose();
      return;
    }

    if (
      !student.name.trim() ||
      !student.phone.trim() ||
      !student.parentPhone.trim() ||
      !student.classId ||
      !student.groupId ||
      !student.monthlyFee.trim()
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    const monthlyFeeValue = Number(student.monthlyFee);

    if (Number.isNaN(monthlyFeeValue) || monthlyFeeValue < 0) {
      toast.error("Please enter a valid monthly fee.");
      return;
    }

    setSaving(true);

    try {
      if (mode === "edit" && initialStudent) {
        await updateStudent(initialStudent.id, {
          name: student.name.trim(),
          phone: student.phone.trim(),
          parentPhone: student.parentPhone.trim(),
          monthlyFee: monthlyFeeValue,
          classId: student.classId,
          groupId: student.groupId,
        });

        toast.success("Student updated successfully.");
      } else {
        await createStudent({
          name: student.name.trim(),
          phone: student.phone.trim(),
          parentPhone: student.parentPhone.trim(),
          monthlyFee: monthlyFeeValue,
          classId: student.classId,
          groupId: student.groupId,
        });

        toast.success("Student added successfully.");
      }

      onSaved();
      onClose();
    } catch (error: any) {
      console.error("Save Student Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save student."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const title =
    mode === "add"
      ? "Add Student"
      : mode === "edit"
      ? "Edit Student"
      : "Student Details";

  const isViewMode = mode === "view";

  return (
    <Modal open={open} title={title} onClose={onClose} size="lg">
      <div className="space-y-5">
        {/* VIEW MODE: compact details */}
        {isViewMode ? (
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="col-span-1 flex flex-col items-center gap-4">
              <div className="h-24 w-24">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 font-bold text-white text-2xl">
                  {initialStudent?.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("") || "U"}
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold">{initialStudent?.name}</h2>
                <p className="text-sm text-slate-500">{initialStudent?.studentCode}</p>
              </div>
            </div>

            <div className="col-span-2 grid gap-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="font-medium">{initialStudent?.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Parent Phone</p>
                  <p className="font-medium">{initialStudent?.parentPhone || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Class</p>
                  <p className="font-medium">{initialStudent?.class?.title ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Group</p>
                  <p className="font-medium">{initialStudent?.group?.name ?? "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Monthly Fee</p>
                  <p className="font-medium">{initialStudent ? `${initialStudent.monthlyFee.toLocaleString()} EGP` : "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <p className="font-medium">{initialStudent?.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
{/* Attendance Summary */}
<div className="space-y-3 pt-3">
  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
    Attendance Summary
  </p>

  {loadingAttendance ? (
    <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      Loading attendance history...
    </div>
  ) : (
    <>
      {(() => {
        const total = attendances.length;

        const present = attendances.filter(
          (a) => a.status === "PRESENT"
        ).length;

        const absent = attendances.filter(
          (a) => a.status === "ABSENT"
        ).length;

        const percent = total
          ? Math.round((present / total) * 100)
          : 0;

        return (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Total</p>
                <p className="mt-1 text-lg font-bold text-slate-800">
                  {total}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-3">
                <p className="text-xs text-emerald-600">Present</p>
                <p className="mt-1 text-lg font-bold text-emerald-700">
                  {present}
                </p>
              </div>

              <div className="rounded-2xl bg-rose-50 p-3">
                <p className="text-xs text-rose-600">Absent</p>
                <p className="mt-1 text-lg font-bold text-rose-700">
                  {absent}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  Attendance Rate
                </p>

                <p className="text-lg font-bold text-indigo-600">
                  {percent}%
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Recent Attendance
              </p>

              {total === 0 ? (
                <div className="mt-2 rounded-2xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                  No attendance history available.
                </div>
              ) : (
                <div className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1">
                  {attendances.slice(0, 8).map((attendance) => (
                    <div
                      key={attendance.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {new Date(
                            attendance.date
                          ).toLocaleDateString()}
                        </p>

                        {attendance.method && (
                          <p className="text-xs text-slate-400">
                            Method: {attendance.method}
                          </p>
                        )}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          attendance.status === "PRESENT"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {attendance.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );
      })()}
    </>
  )}
</div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-slate-400">Recent Attendance</p>
                    <div className="mt-2 space-y-1 max-h-40 overflow-auto">
                      {(initialStudent as any).attendances.slice(0, 8).map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                          <div className="text-sm">{new Date(a.date).toLocaleDateString()}</div>
                          <div className={`text-sm font-semibold ${a.status === 'PRESENT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {a.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <p className="text-xs text-slate-400">Attendance</p>
                  <p className="text-sm text-slate-500">No attendance history available.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ADD / EDIT MODE (existing inputs) */
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              disabled={isViewMode}
              placeholder="Student Name"
              value={student.name}
              onChange={(e) =>
                setStudent((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
            <Input
              disabled={isViewMode}
              placeholder="Phone"
              value={student.phone}
              onChange={(e) =>
                setStudent((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
            />
            <Input
              disabled={isViewMode}
              placeholder="Parent Phone"
              value={student.parentPhone}
              onChange={(e) =>
                setStudent((prev) => ({
                  ...prev,
                  parentPhone: e.target.value,
                }))
              }
            />

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Class
              </label>
              <select
                disabled={isViewMode}
                value={student.classId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select Class</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Group
              </label>
              {student.classId && groups.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  No groups available for this class. Please add a group first.
                </div>
              ) : (
                <select
                  disabled={isViewMode}
                  value={student.groupId}
                  onChange={(e) =>
                    setStudent((prev) => ({
                      ...prev,
                      groupId: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select Group</option>
                  {groups.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <Input
              disabled={isViewMode}
              type="number"
              placeholder="Monthly Fee"
              value={student.monthlyFee}
              onChange={(e) =>
                setStudent((prev) => ({
                  ...prev,
                  monthlyFee: e.target.value,
                }))
              }
            />

          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold transition hover:bg-slate-100"
          >
            Close
          </button>
          {!isViewMode && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : mode === "edit" ? "Update Student" : "Save Student"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
