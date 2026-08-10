import {
  FiHome,
  FiUsers,
  FiGrid,
  FiLayers,
  FiCheckSquare,
  FiDollarSign,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";

export const sidebarLinks = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: FiHome,
  },
  {
    title: "Students",
    path: "/students",
    icon: FiUsers,
  },
  {
    title: "Classes",
    path: "/classes",
    icon: FiGrid,
  },
  {
    title: "Groups",
    path: "/groups",
    icon: FiLayers,
  },
  {
    title: "Attendance",
    path: "/attendance",
    icon: FiCheckSquare,
  },
  {
    title: "Payments",
    path: "/payments",
    icon: FiDollarSign,
  },
  {
    title: "Reports",
    path: "/reports",
    icon: FiBarChart2,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: FiSettings,
  },
];