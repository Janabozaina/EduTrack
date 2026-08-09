import api from "./api";

export interface AttendanceSession {
  id: string;
  token: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  qr: string;
}

export async function getCurrentAttendance() {
  const { data } = await api.get("/attendance/current");
  return data;
}

export async function startAttendance() {
  const { data } = await api.post("/attendance/start");
  return data;
}

export async function stopAttendance() {
  const { data } = await api.post("/attendance/stop");
  return data;
}

export async function scanAttendance(token: string, studentId: string) {
  const { data } = await api.post("/attendance/scan", { token, studentId });
  return data;
}

// New: get attendance for group/date
export async function getAttendance(groupId: string, date: string) {
  const { data } = await api.get("/attendance", { params: { groupId, date } });
  return data;
}

// New: save attendance records for group/date
export async function saveAttendance(groupId: string, date: string, records: Array<{ studentId: string; status: "PRESENT" | "ABSENT" }>) {
  const { data } = await api.post("/attendance", { groupId, date, records });
  return data;
}
