import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { getPayments, createPayment, updatePaymentStatus, deletePayment } from "../../services/payment.service";
import { getStudents } from "../../services/student.service";
import { getClasses } from "../../services/class.service";
import { getGroups } from "../../services/group.service";
import type { Student } from "../../types/student";

interface PaymentItem {
  id: string;
  month: number;
  year: number;
  amount: number;
  status: string;
  paidAt: string | null;
  student: {
    id: string;
    name: string;
    studentCode: string;
    monthlyFee: number;
    class?: {
      id: string;
      title: string;
    };
    group?: {
      id: string;
      name: string;
    };
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Array<{ id: string; title: string }>>([]);
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 0,
    status: "PENDING" as "PAID" | "PENDING",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadGroups(selectedClass);
  }, [selectedClass]);

  useEffect(() => {
    loadPayments();
  }, [selectedClass, selectedGroup, filterMonth, filterYear]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [classData, studentData] = await Promise.all([
        getClasses(),
        getStudents({ limit: 1000 }),
      ]);
      setClasses(classData);
      setStudents(studentData.data);
    } catch (error: any) {
      toast.error("Failed to load payment data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadGroups(classId: string) {
    if (!classId) {
      setGroups([]);
      setSelectedGroup("");
      return;
    }

    try {
      const groupData: Array<{ id: string; name: string }> = await getGroups(classId);
      setGroups(groupData);
      if (!groupData.some((group) => group.id === selectedGroup)) {
        setSelectedGroup("");
      }
    } catch (error: any) {
      console.error(error);
    }
  }

  async function loadPayments() {
    setLoading(true);
    try {
      const response = await getPayments({
        classId: selectedClass || undefined,
        groupId: selectedGroup || undefined,
        month: filterMonth,
        year: filterYear,
      });
      setPayments(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }

  const openModal = () => {
    setForm((prev) => ({
      ...prev,
      studentId: students[0]?.id ?? "",
    }));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  async function handleSave() {
    if (!form.studentId || form.amount <= 0) {
      toast.error("Please select a student and enter a valid amount.");
      return;
    }

    setSaving(true);

    try {
      await createPayment({
        studentId: form.studentId,
        month: form.month,
        year: form.year,
        amount: form.amount,
        status: form.status,
      });
      toast.success("Payment recorded successfully.");
      closeModal();
      loadPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create payment.");
    } finally {
      setSaving(false);
    }
  }

  const handleStatusChange = async (payment: PaymentItem) => {
    const nextStatus = payment.status === "PAID" ? "PENDING" : "PAID";

    try {
      await updatePaymentStatus(payment.id, nextStatus as "PAID" | "PENDING");
      toast.success("Payment status updated.");
      loadPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update payment.");
    }
  };

  const handleDelete = async (payment: PaymentItem) => {
    if (!window.confirm("Delete this payment record?")) return;
    try {
      await deletePayment(payment.id);
      toast.success("Payment deleted.");
      loadPayments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete payment.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-gray-500">Track payment records and update payment status.</p>
        </div>

        <button
          onClick={openModal}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          + Record Payment
        </button>
      </div>

      <Card>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All Classes</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              disabled={!selectedClass || groups.length === 0}
            >
              <option value="">All Groups</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Month</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {Array.from({ length: 3 }, (_, index) => new Date().getFullYear() - 1 + index).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex h-72 items-center justify-center">Loading payments...</div>
      ) : payments.length === 0 ? (
        <Card>
          <div className="py-16 text-center text-slate-500">
            No payments found for the selected filters.
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-500 md:grid">
            <div>Student</div>
            <div>Monthly Fee</div>
            <div>Paid</div>
            <div>Remaining</div>
            <div className="text-right">Action</div>
          </div>

          {payments.map((payment) => {
            const fee = payment.student.monthlyFee ?? 0;
            const paid = payment.amount ?? 0;
            const remaining = Math.max(0, fee - paid);
            const courseLabel = [payment.student.class?.title, payment.student.group?.name].filter(Boolean).join(" • ");

            return (
              <Card key={payment.id}>
                <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center">
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm text-slate-400">Student</p>
                    <p className="text-lg font-semibold truncate">{payment.student.name}</p>
                    <p className="text-sm text-slate-500 truncate">{payment.student.studentCode}</p>
                    <p className="text-sm text-slate-500 truncate">{courseLabel}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Monthly Fee</p>
                    <p className="font-semibold">{fee.toLocaleString()} EGP</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Paid</p>
                    <p className="font-semibold">{paid.toLocaleString()} EGP</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">Remaining</p>
                    <p className="font-semibold">{remaining.toLocaleString()} EGP</p>
                  </div>

                  <div className="flex flex-col gap-3 md:items-end">
                    <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${payment.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {payment.status === "PAID" ? "Paid" : "Pending"}
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => handleStatusChange(payment)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        {payment.status === "PAID" ? "Mark Pending" : "Mark Paid"}
                      </button>
                      <button
                        onClick={() => handleDelete(payment)}
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} title="Record Payment" onClose={closeModal}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Student</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.studentCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              type="number"
              value={form.month}
              onChange={(e) => setForm((prev) => ({ ...prev, month: Number(e.target.value) }))}
              placeholder="Month"
            />
            <Input
              type="number"
              value={form.year}
              onChange={(e) => setForm((prev) => ({ ...prev, year: Number(e.target.value) }))}
              placeholder="Year"
            />
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
              placeholder="Amount"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as "PAID" | "PENDING" }))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={closeModal}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
