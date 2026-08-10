import api from "./api";

interface CreateStudentPayload {
  name: string;
  phone: string;
  parentPhone: string;
  monthlyFee: number;
  classId: string;
  groupId: string;
}

export const getStudents = async (params?: {
  search?: string;
  classId?: string;
  groupId?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get("/students", {
    params,
  });

  return response.data;
};

export async function createStudent(data: CreateStudentPayload) {
  const response = await api.post("/students", data);
  return response.data;
}

export const updateStudent = async (
  id: string,
  data: Partial<CreateStudentPayload> & { isActive?: boolean }
) => {
  const response = await api.put(`/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id: string) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

export const getStudentAttendance = async (studentId: string) => {
  const response = await api.get(`/students/${studentId}/attendance`);
  return response.data;
};