import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Card from "../../components/ui/Card";
import { getCurrentAttendance, startAttendance, stopAttendance, getAttendance, saveAttendance } from "../../services/attendance.service";
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

export default function AttendancePage() {
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [working, setWorking] = useState(false);

  const [classes, setClasses] = useState<Array<{ id: string; title: string }>>([]);
  const [groups, setGroups] = useState<Array<{ id: string; name: string; _count?: { students: number } }>>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [students, setStudents] = useState<Array<Student & { status?: "PRESENT" | "ABSENT" | null }>>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSession();
    loadClasses();
  }, []);

  useEffect(() => {
    // when class changes, load groups
    if (!selectedClass) {
      setGroups([]);
      setSelectedGroup("");
      return;
    }

    (async () => {
      try {
        const g = await getGroups(selectedClass);
        setGroups(g);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [selectedClass]);

  useEffect(() => {
    // when group or date changes, load students + attendance
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
      toast.error(error.response?.data?.message || "Unable to fetch attendance session.");
      setSession(null);
    } finally {
      setLoadingSession(false);
    }
  }

  async function loadClasses() {
    try {
      const data = await getClasses();
      setClasses(data);
      if (data.length && !selectedClass) setSelectedClass(data[0].id);
    } catch (error: any) {
      toast.error("Failed to load classes.");
    }
  }

  async function loadStudentsForGroup(groupId: string, dateStr: string) {
    setLoadingList(true);
    try {
      // get students in group
      const studentsResp = await getStudents({ groupId, limit: 1000 });
      const list: Student[] = studentsResp.data;

      // get attendance records for that group/date
      const attResp = await getAttendance(groupId, dateStr);
      const attData: Array<any> = attResp.data;

      // merge attendance status into students
      const merged = list.map((s) => {
        const found = attData.find((a) => a.id === s.id);
        return {
          ...s,
          status: found && found.attendance ? (found.attendance.status as "PRESENT" | "ABSENT") : null,
        };
      });

      setStudents(merged);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load students for group.");
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
        toast.success(response.message || "Attendance session started.");
        setSession(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not start attendance.");
    } finally {
      setWorking(false);
    }
  }

  async function handleStop() {
    setWorking(true);
    try {
      const response = await stopAttendance();
      if (response.success) {
        toast.success(response.message || "Attendance session stopped.");
        setSession(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not stop attendance.");
    } finally {
      setWorking(false);
    }
  }

  function setStatusForStudent(studentId: string, status: "PRESENT" | "ABSENT" | null) {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status } : s)));
  }

  function markAll(status: "PRESENT" | "ABSENT") {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  }

  const totals = {
    total: students.length,
    present: students.filter((s) => s.status === "PRESENT").length,
    absent: students.filter((s) => s.status === "ABSENT").length,
  };
  const attendancePercent = totals.total ? Math.round((totals.present / totals.total) * 100) : 0;

  async function handleSave() {
    if (!selectedGroup) {
      toast.error("Please select a group.");
      return;
    }

    setSaving(true);
    try {
      const records = students
        .filter((s) => s.status === "PRESENT" || s.status === "ABSENT")
        .map((s) => ({ studentId: s.id, status: s.status as "PRESENT" | "ABSENT" }));

      await saveAttendance(selectedGroup, date, records);
      toast.success("Attendance saved.");
      // reload
      loadStudentsForGroup(selectedGroup, date);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-gray-500">Record attendance by class and group.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleStart}
            disabled={working}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Start Session
          </button>
          <button
            onClick={handleStop}
            disabled={working || !session}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Stop Session
          </button>
        </div>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-3 items-end">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Group</label>
            <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <option value="">Select Group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name} — {g._count?.students ?? 0} Students</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>Total: <span className="font-semibold">{totals.total}</span></div>
            <div>Present: <span className="font-semibold">{totals.present}</span></div>
            <div>Absent: <span className="font-semibold">{totals.absent}</span></div>
            <div>Attendance: <span className="font-semibold">{attendancePercent}%</span></div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => markAll("PRESENT")} className="rounded-xl border border-slate-200 px-4 py-2 bg-emerald-50 text-emerald-700">Mark All Present</button>
            <button onClick={() => markAll("ABSENT")} className="rounded-xl border border-slate-200 px-4 py-2 bg-rose-50 text-rose-700">Mark All Absent</button>
            <button onClick={handleSave} disabled={saving} className="rounded-xl bg-indigo-600 px-4 py-2 text-white">{saving ? 'Saving...' : 'Save Attendance'}</button>
          </div>
        </div>

        <div className="mt-4">
          {loadingList ? (
            <div className="py-12 text-center">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No students in this group.</div>
          ) : (
            <div className="space-y-2">
              {students.map((s) => (
                <div key={s.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">{s.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{s.name}</div>
                      <div className="text-sm text-slate-500 truncate">{s.studentCode}</div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-0 flex w-full sm:w-auto gap-2">
                    <button onClick={() => setStatusForStudent(s.id, 'PRESENT')} className={`flex-1 sm:flex-none px-3 py-2 rounded-md ${s.status === 'PRESENT' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}>Present</button>
                    <button onClick={() => setStatusForStudent(s.id, 'ABSENT')} className={`flex-1 sm:flex-none px-3 py-2 rounded-md ${s.status === 'ABSENT' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'}`}>Absent</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </Card>

      {/* Current session QR card */}
      {loadingSession ? null : session ? (
        <Card>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400">Current Session</p>
              <p className="mt-2 text-2xl font-semibold">Active</p>
              <div className="mt-4 space-y-2 text-sm text-slate-500">
                <p>
                  <span className="font-semibold text-slate-700">Session ID:</span> {session.id}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Expires at:</span>{" "}
                  {new Date(session.expiresAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Created at:</span>{" "}
                  {new Date(session.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img src={session.qr} alt="Attendance QR code" className="max-h-80 rounded-3xl border border-slate-200" />
            </div>
          </div>
        </Card>
      ) : null}

    </div>
  );
}
