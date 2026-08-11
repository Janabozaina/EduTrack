import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiUsers, FiUserCheck, FiUserX, FiDollarSign } from "react-icons/fi";
import toast from "react-hot-toast";

import DashboardCard from "../../components/dashboard/DashboardCard";
import StudentModal from "../../components/modals/StudentModal";
import StudentsTable from "../../components/tables/StudentsTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import type { Student } from "../../types/student";
import { getStudents, deleteStudent } from "../../services/student.service";

export default function StudentsPage() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit" | "view">("add");

  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  useEffect(() => {
    loadStudents();
  }, [search]);

  async function loadStudents() {
    setLoading(true);

    try {
      const data = await getStudents({
        search: search.trim() || undefined,
        limit: 1000,
      });

      setStudents(data.data || []);
    } catch (error: any) {
      console.error("Load Students Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to load students."
      );

      setStudents([]);
    } finally {
      setLoading(false);
    }
  }

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => student.isActive
  ).length;

  const inactiveStudents = totalStudents - activeStudents;

  const monthlyIncome = students.reduce(
    (sum, student) => sum + Number(student.monthlyFee || 0),
    0
  );

  const handleOpenAdd = () => {
    setCurrentStudent(null);
    setMode("add");
    setOpen(true);
  };

  const handleViewStudent = (student: Student) => {
    setCurrentStudent(student);
    setMode("view");
    setOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setCurrentStudent(student);
    setMode("edit");
    setOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      await deleteStudent(studentToDelete.id);

      toast.success("Student deleted successfully.");

      setConfirmOpen(false);
      setStudentToDelete(null);

      await loadStudents();
    } catch (error: any) {
      console.error("Delete Student Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete student."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm font-medium text-slate-500">
          Loading students...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Students
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {search
              ? `Search results for "${search}"`
              : "Manage all students."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
        >
          + Add Student
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Total Students"
          value={totalStudents}
          icon={<FiUsers size={26} />}
        />

        <DashboardCard
          title="Active Students"
          value={activeStudents}
          icon={<FiUserCheck size={26} />}
        />

        <DashboardCard
          title="Inactive Students"
          value={inactiveStudents}
          icon={<FiUserX size={26} />}
        />

        <DashboardCard
          title="Monthly Income"
          value={`${monthlyIncome.toLocaleString()} EGP`}
          icon={<FiDollarSign size={26} />}
        />
      </div>

      {/* Students Table */}
      <div className="min-w-0">
        <StudentsTable
          students={students}
          onView={handleViewStudent}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
        />
      </div>

      {/* Student Modal */}
      <StudentModal
        open={open}
        mode={mode}
        student={currentStudent}
        onClose={() => setOpen(false)}
        onSaved={loadStudents}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete student"
        description="Are you sure you want to delete this student? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setStudentToDelete(null);
        }}
      />
    </div>
  );
}
