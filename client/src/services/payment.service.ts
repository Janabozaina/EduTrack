import api from "./api";

export type PaymentStatus = "PAID" | "PENDING";

export async function getPayments(params?: {
  classId?: string;
  groupId?: string;
  month?: number;
  year?: number;
}) {
  const { data } = await api.get("/payments", {
    params,
  });
  return data;
}

export async function createPayment(payment: {
  studentId: string;
  month: number;
  year: number;
  amount: number;
  status: PaymentStatus;
}) {
  const { data } = await api.post("/payments", payment);
  return data;
}

export async function updatePaymentStatus(id: string, status: PaymentStatus) {
  const { data } = await api.patch(`/payments/${id}`, { status });
  return data;
}

export async function deletePayment(id: string) {
  const { data } = await api.delete(`/payments/${id}`);
  return data;
}
