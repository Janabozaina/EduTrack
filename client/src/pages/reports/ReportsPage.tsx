import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import toast from "react-hot-toast";

import Card from "../../components/ui/Card";
import { getDashboard } from "../../services/dashboard.service";
import type { DashboardData } from "../../services/dashboard";

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

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardData>(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const response = await getDashboard();
      if (response.success) {
        setStats(response.data);
      } else {
        toast.error(response.message || "Failed to load report data.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load report data.");
    } finally {
      setLoading(false);
    }
  }

  const chartData = [
    { name: "Classes", value: stats.totalClasses },
    { name: "Groups", value: stats.totalGroups },
    { name: "Paid", value: stats.paidPayments },
    { name: "Pending", value: stats.pendingPayments },
    { name: "Attendance", value: stats.todayAttendance },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">Loading reports...</div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-gray-500">View overall statistics and recent report summaries.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-400">Total Students</p>
          <p className="mt-3 text-3xl font-bold">{stats.totalStudents}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Active Students</p>
          <p className="mt-3 text-3xl font-bold">{stats.activeStudents}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Total Income</p>
          <p className="mt-3 text-3xl font-bold">{stats.totalIncome.toLocaleString()} EGP</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Pending Payments</p>
          <p className="mt-3 text-3xl font-bold">{stats.pendingPayments}</p>
        </Card>
      </div>

      <Card>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
