import api from "./api";

export async function getGroups(classId?: string) {
  const { data } = await api.get("/groups", {
    params: classId ? { classId } : undefined,
  });
  return data.data;
}

export async function createGroup(group: {
  name: string;
  classId: string;
  day?: string;
  startTime?: string;
  room?: string;
}) {
  const { data } = await api.post("/groups", group);
  return data;
}

export async function updateGroup(id: string, group: {
  name: string;
  day?: string;
  startTime?: string;
  room?: string;
}) {
  const { data } = await api.put(`/groups/${id}`, group);
  return data;
}

export async function deleteGroup(id: string) {
  const { data } = await api.delete(`/groups/${id}`);
  return data;
}
