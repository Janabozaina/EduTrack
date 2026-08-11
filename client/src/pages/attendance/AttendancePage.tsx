import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Card from "../../components/ui/Card";
import {
  getCurrentAttendance,
  startAttendance,
  stopAttendance,
  getAttendance,
  saveAttendance,
} from "../../services/attendance.service";
import { getClasses } from "../../services/class.service";
import { getGroups } from "../../services/group.service";
import { getStudents } from "../../services/student.service";
import type { Student } from "../../types/student";

interface AttendanceSession {
  id: string;
  token: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  qr: string;
}

type AttendanceStatus = "PRESENT" | "ABSENT" | null;

type AttendanceStudent = Student & {
  status?: AttendanceStatus;
};

export default function AttendancePage() {
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [working, setWorking] = useState(false);

  const [classes, setClasses] = useState<
    Array<{ id: string; title: string }>
  >([]);

  const [groups, setGroups] = useState<
    Array<{
      id: string;
      name: string;
      _count?: {
        students: number;
      };
    }>
  >([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSession();
    loadClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setGroups([]);
      setSelectedGroup("");
      return;
    }

    (async () => {
      try {
        const data = await getGroups(selectedClass);
        setGroups(data);

        // Reset selected group if it no longer belongs to the selected class
        setSelectedGroup((currentGroup) => {
          const exists = data.some(
  (group: { id: string }) => group.id === currentGroup
);
          return exists ? currentGroup : "";
        });
      } catch (error) {
        console.error(error);
        setGroups([]);
        setSelectedGroup("");
      }
    })();
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedGroup) {
      setStudents([]);
      return;
    }

    loadStudentsForGroup(selectedGroup, date);
  }, [selectedGroup, date]);

  async function fetchSession() {
    setLoadingSession(true);

    try {
      const response = await getCurrentAttendance();

      if (response.success) {
        setSession(response.data);
      } else {
        setSession(null);
      }
    } catch (error: any) {
      console.error("Fetch Session Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to fetch attendance session."
      );

      setSession(null);
    } finally {
      setLoadingSession(false);
    }
  }

  async function loadClasses() {
    try {
      const data = await getClasses();

      setClasses(data);

      if (data.length && !selectedClass) {
        setSelectedClass(data[0].id);
      }
    } catch (error) {
      console.error("Load Classes Error:", error);
      toast.error("Failed to load classes.");
    }
  }

  async function loadStudentsForGroup(
    groupId: string,
    dateStr: string
  ) {
    setLoadingList(true);

    try {
      const studentsResp = await getStudents({
        groupId,
        limit: 1000,
      });

      const list: Student[] = studentsResp.data ?? [];

      const attResp = await getAttendance(groupId, dateStr);
      const attData: Array<any> = attResp.data ?? [];

      const merged: AttendanceStudent[] = list.map((student) => {
        const found = attData.find(
          (attendance) => attendance.id === student.id
        );

        return {
          ...student,
          status:
            found && found.attendance
              ? (found.attendance.status as "PRESENT" | "ABSENT")
              : null,
        };
      });

      setStudents(merged);
    } catch (error: any) {
      console.error("Load Students Attendance Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load students for group."
      );

      setStudents([]);
    } finally {
      setLoadingList(false);
    }
  }

  async function handleStart() {
    setWorking(true);

    try {
      const response = await startAttendance();

      if (response.success) {
        toast.success(
          response.message || "Attendance session started."
        );

        setSession(response.data);
      }
    } catch (error: any) {
      console.error("Start Attendance Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Could not start attendance."
      );
    } finally {
      setWorking(false);
    }
  }

  async function handleStop() {
    setWorking(true);

    try {
      const response = await stopAttendance();

      if (response.success) {
        toast.success(
          response.message || "Attendance session stopped."
        );

        setSession(null);
      }
    } catch (error: any) {
      console.error("Stop Attendance Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Could not stop attendance."
      );
    } finally {
      setWorking(false);
    }
  }

  function setStatusForStudent(
    studentId: string,
    status: "PRESENT" | "ABSENT" | null
  ) {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              status,
            }
          : student
      )
    );
  }

  function markAll(status: "PRESENT" | "ABSENT") {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status,
      }))
    );
  }

  const totals = {
    total: students.length,
    present: students.filter(
      (student) => student.status === "PRESENT"
    ).length,
    absent: students.filter(
      (student) => student.status === "ABSENT"
    ).length,
  };

  const attendancePercent = totals.total
    ? Math.round((totals.present / totals.total) * 100)
    : 0;

  async function handleSave() {
    if (!selectedGroup) {
      toast.error("Please select a group.");
      return;
    }

    setSaving(true);

    try {
      const records = students
        .filter(
          (student) =>
            student.status === "PRESENT" ||
            student.status === "ABSENT"
        )
        .map((student) => ({
          studentId: student.id,
          status: student.status as "PRESENT" | "ABSENT",
        }));

      await saveAttendance(selectedGroup, date, records);

      toast.success("Attendance saved.");

      await loadStudentsForGroup(selectedGroup, date);
    } catch (error: any) {
      console.error("Save Attendance Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full space-y-5 pb-6 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Attendance
          </h1>

          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Record attendance by class and group.
          </p>
        </div>

        {/* Session Actions */}
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:gap-3">
          <button
            type="button"
            onClick={handleStart}
            disabled={working}
            className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
          >
            Start Session
          </button>

          <button
            type="button"
            onClick={handleStop}
            disabled={working || !session}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
          >
            Stop Session
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="min-w-0">
            <label className="block text-sm font-semibold text-slate-700">
              Class
            </label>

            <select
              value={selectedClass}
              onChange={(e) =>
                setSelectedClass(e.target.value)
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select Class</option>

              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-semibold text-slate-700">
              Group
            </label>

            <select
              value={selectedGroup}
              onChange={(e) =>
                setSelectedGroup(e.target.value)
              }
              disabled={!selectedClass}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Select Group</option>

              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} —{" "}
                  {group._count?.students ?? 0} Students
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-semibold text-slate-700">
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </Card>

      {/* Attendance List */}
      <Card>
        <div className="space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Total
              </p>

              <p className="mt-1 text-xl font-bold text-slate-800 sm:text-2xl">
                {totals.total}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-medium text-emerald-600">
                Present
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-700 sm:text-2xl">
                {totals.present}
              </p>
            </div>

            <div className="rounded-2xl bg-rose-50 p-4">
              <p className="text-xs font-medium text-rose-600">
                Absent
              </p>

              <p className="mt-1 text-xl font-bold text-rose-700 sm:text-2xl">
                {totals.absent}
              </p>
            </div>

            <div className="rounded-2xl bg-indigo-50 p-4">
              <p className="text-xs font-medium text-indigo-600">
                Attendance
              </p>

              <p className="mt-1 text-xl font-bold text-indigo-700 sm:text-2xl">
                {attendancePercent}%
              </p>
            </div>
          </div>

          {/* Progress */}
          {totals.total > 0 && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-700">
                  Attendance Progress
                </span>

                <span className="text-sm font-bold text-indigo-600">
                  {attendancePercent}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{
                    width: `${attendancePercent}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Students
              </h2>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Select Present or Absent for each student.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex">
              <button
                type="button"
                onClick={() => markAll("PRESENT")}
                disabled={students.length === 0}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark All Present
              </button>

              <button
                type="button"
                onClick={() => markAll("ABSENT")}
                disabled={students.length === 0}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark All Absent
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || students.length === 0}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </div>

          {/* Students */}
          <div>
            {loadingList ? (
              <div className="rounded-2xl bg-slate-50 py-12 text-center text-sm text-slate-500">
                Loading students...
              </div>
            ) : students.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
                {selectedGroup
                  ? "No students in this group."
                  : "Select a group to view students."}
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student) => {
                  const initials =
                    student.name
                      ?.split(" ")
                      .map((name) => name[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "U";

                  return (
                    <div
                      key={student.id}
                      className="rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-slate-200 hover:shadow-sm sm:p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {/* Student Info */}
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 sm:h-11 sm:w-11">
                            {initials}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800 sm:text-base">
                              {student.name}
                            </p>

                            <p className="truncate text-xs text-slate-500 sm:text-sm">
                              {student.studentCode}
                            </p>
                          </div>
                        </div>

                        {/* Status Buttons */}
                        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
                          <button
                            type="button"
                            onClick={() =>
                              setStatusForStudent(
                                student.id,
                                "PRESENT"
                              )
                            }
                            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                              student.status === "PRESENT"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            Present
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setStatusForStudent(
                                student.id,
                                "ABSENT"
                              )
                            }
                            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                              student.status === "ABSENT"
                                ? "bg-rose-600 text-white shadow-sm"
                                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Current Session QR */}
      {!loadingSession && session && (
        <Card>
          <div className="space-y-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8 lg:space-y-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                <p className="text-sm font-semibold text-emerald-600">
                  Current Session
                </p>
              </div>

              <h2 className="mt-2 text-2xl font-bold text-slate-800">
                Active
              </h2>

              <div className="mt-4 space-y-3 text-sm text-slate-500">
                <div className="overflow-hidden">
                  <span className="font-semibold text-slate-700">
                    Session ID:
                  </span>{" "}
                  <span className="break-all">{session.id}</span>
                </div>

                <p>
                  <span className="font-semibold text-slate-700">
                    Expires at:
                  </span>{" "}
                  {new Date(session.expiresAt).toLocaleString()}
                </p>

                <p>
                  <span className="font-semibold text-slate-700">
                    Created at:
                  </span>{" "}
                  {new Date(session.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                <img
                  src={session.qr}
                  alt="Attendance QR code"
                  className="h-auto w-full max-w-[280px] rounded-2xl"
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
