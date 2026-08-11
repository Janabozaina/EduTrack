
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

interface AttendanceRecord {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT";
  method?: "MANUAL" | "QR";
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

  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [student, setStudent] = useState({
    name: "",
    phone: "",
    parentPhone: "",
    monthlyFee: "",
    classId: "",
    groupId: "",
  });

  const isViewMode = mode === "view";

  useEffect(() => {
    if (!open) return;

    loadClasses();

    if (!initialStudent) {
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
      setLoadingAttendance(false);
      return;
    }

    setStudent({
      name: initialStudent.name,
      phone: initialStudent.phone ?? "",
      parentPhone: initialStudent.parentPhone ?? "",
      monthlyFee: String(initialStudent.monthlyFee),
      classId: initialStudent.class?.id ?? "",
      groupId: initialStudent.group?.id ?? "",
    });

    if (initialStudent.class?.id) {
      loadGroups(initialStudent.class.id);
    } else {
      setGroups([]);
    }

    if (mode === "view") {
      loadStudentAttendance(initialStudent.id);
    } else {
      setAttendances([]);
      setLoadingAttendance(false);
    }
  }, [open, initialStudent, mode]);

  async function loadClasses() {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (error) {
      console.error("Load Classes Error:", error);
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
      console.error("Load Groups Error:", error);
      setGroups([]);
    }
  }

  async function loadStudentAttendance(studentId: string) {
    setLoadingAttendance(true);
    setAttendances([]);

    try {
      const response = await getStudentAttendance(studentId);

      if (response?.success) {
        setAttendances(response.data ?? []);
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

  const totalAttendance = attendances.length;

  const presentCount = attendances.filter(
    (attendance) => attendance.status === "PRESENT"
  ).length;

  const absentCount = attendances.filter(
    (attendance) => attendance.status === "ABSENT"
  ).length;

  const attendanceRate = totalAttendance
    ? Math.round((presentCount / totalAttendance) * 100)
    : 0;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="max-h-[80vh] overflow-y-auto pr-1">
        {isViewMode ? (
          <div className="space-y-5">
            {/* Student Header */}
            <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-bold text-indigo-600">
                {initialStudent?.name
                  ?.split(" ")
                  .map((name) => name[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-slate-800">
                  {initialStudent?.name || "-"}
                </h3>

                <p className="text-sm text-slate-500">
                  {initialStudent?.studentCode || "-"}
                </p>
              </div>
            </div>

            {/* Student Information */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Phone</p>
                <p className="mt-1 break-words font-medium text-slate-700">
                  {initialStudent?.phone || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Parent Phone</p>
                <p className="mt-1 break-words font-medium text-slate-700">
                  {initialStudent?.parentPhone || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Class</p>
                <p className="mt-1 font-medium text-slate-700">
                  {initialStudent?.class?.title ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Group</p>
                <p className="mt-1 font-medium text-slate-700">
                  {initialStudent?.group?.name ?? "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Monthly Fee</p>
                <p className="mt-1 font-medium text-slate-700">
                  {initialStudent
                    ? `${initialStudent.monthlyFee.toLocaleString()} EGP`
                    : "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Status</p>
                <p
                  className={`mt-1 font-semibold ${
                    initialStudent?.isActive
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {initialStudent?.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>

            {/* Attendance */}
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  Attendance History
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  Student attendance summary and recent records.
                </p>
              </div>

              {loadingAttendance ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Loading attendance history...
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3 sm:p-4">
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="mt-1 text-lg font-bold text-slate-800 sm:text-xl">
                        {totalAttendance}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-emerald-50 p-3 sm:p-4">
                      <p className="text-xs text-emerald-600">Present</p>
                      <p className="mt-1 text-lg font-bold text-emerald-700 sm:text-xl">
                        {presentCount}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-rose-50 p-3 sm:p-4">
                      <p className="text-xs text-rose-600">Absent</p>
                      <p className="mt-1 text-lg font-bold text-rose-700 sm:text-xl">
                        {absentCount}
                      </p>
                    </div>
                  </div>

                  {/* Attendance Rate */}
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-700">
                        Attendance Rate
                      </p>

                      <p className="text-lg font-bold text-indigo-600">
                        {attendanceRate}%
                      </p>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{
                          width: `${attendanceRate}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Recent Attendance */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Recent Attendance
                      </p>

                      {totalAttendance > 0 && (
                        <span className="text-xs text-slate-400">
                          {totalAttendance} record
                          {totalAttendance !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {totalAttendance === 0 ? (
                      <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                        No attendance history available.
                      </div>
                    ) : (
                      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                        {attendances.slice(0, 8).map((attendance) => (
                          <div
                            key={attendance.id}
                            className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3 sm:px-4"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-700">
                                {new Date(
                                  attendance.date
                                ).toLocaleDateString()}
                              </p>

                              {attendance.method && (
                                <p className="mt-0.5 text-xs text-slate-400">
                                  Method: {attendance.method}
                                </p>
                              )}
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
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
              )}
            </div>
          </div>
        ) : (
          /* ADD / EDIT MODE */
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
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
                placeholder="Parent Phone"
                value={student.parentPhone}
                onChange={(e) =>
                  setStudent((prev) => ({
                    ...prev,
                    parentPhone: e.target.value,
                  }))
                }
              />

              <Input
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

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Class
                </label>

                <select
                  value={student.classId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select Class</option>

                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Group
                </label>

                {student.classId && groups.length === 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    No groups available for this class. Please add a group
                    first.
                  </div>
                ) : (
                  <select
                    value={student.groupId}
                    onChange={(e) =>
                      setStudent((prev) => ({
                        ...prev,
                        groupId: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold transition hover:bg-slate-100 sm:w-auto"
          >
            Close
          </button>

          {!isViewMode && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving
                ? "Saving..."
                : mode === "edit"
                ? "Update Student"
                : "Save Student"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
