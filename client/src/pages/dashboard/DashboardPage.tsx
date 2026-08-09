import { useEffect, useState } from "react";

import StatCard from "../../components/common/StatCard";
import { getDashboard } from "../../services/dashboard.service";
import type { DashboardData } from "../../services/dashboard";
import toast from "react-hot-toast";

const initialStats: DashboardData = {
  totalStudents: 0,
  activeStudents: 0,
  totalClasses: 0,
  totalGroups: 0,
  todayAttendance: 0,
  paidPayments: 0,
  pendingPayments: 0,
  totalIncome: 0,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardData>(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const result = await getDashboard();
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        toast.error(result.message || "Unable to load dashboard data.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">Loading dashboard...</div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Students" value={stats.totalStudents} />
        <StatCard title="Classes" value={stats.totalClasses} />
        <StatCard title="Groups" value={stats.totalGroups} />
        <StatCard title="Income" value={`${stats.totalIncome.toLocaleString()} EGP`} />
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">Today's Summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Attendance</p>
            <p className="mt-2 text-2xl font-bold">{stats.todayAttendance}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Paid Payments</p>
            <p className="mt-2 text-2xl font-bold">{stats.paidPayments}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Pending Payments</p>
            <p className="mt-2 text-2xl font-bold">{stats.pendingPayments}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Active Students</p>
            <p className="mt-2 text-2xl font-bold">{stats.activeStudents}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
