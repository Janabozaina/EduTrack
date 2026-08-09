import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import RequireAuth from "../components/common/RequireAuth";
import { getToken } from "../services/auth.service";

import DashboardPage from "../pages/dashboard/DashboardPage";
import StudentsPage from "../pages/students/StudentsPage";
import ClassesPage from "../pages/classes/ClassesPage";
import GroupsPage from "../pages/groups/GroupsPage";
import AttendancePage from "../pages/attendance/AttendancePage";
import PaymentsPage from "../pages/payments/PaymentsPage";
import ReportsPage from "../pages/reports/ReportsPage";
import SettingsPage from "../pages/settings/SettingsPage";
import LoginPage from "../pages/auth/LoginPage";

export default function AppRouter() {
  const fallback = getToken() ? "/dashboard" : "/login";

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={fallback} replace />} />
    </Routes>
  );
}
