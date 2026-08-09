import api from "./api";

export async function getClasses() {
  const { data } = await api.get("/classes");
  return data.data;
}

export async function createClass(title: string) {
  const { data } = await api.post("/classes", { title });
  return data;
}

export async function updateClass(id: string, title: string) {
  const { data } = await api.put(`/classes/${id}`, { title });
  return data;
}

export async function deleteClass(id: string) {
  const { data } = await api.delete(`/classes/${id}`);
  return data;
}
