import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col min-w-0">

        <Navbar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 min-w-0">

          <Outlet />

        </main>

      </div>

    </div>
  );
}