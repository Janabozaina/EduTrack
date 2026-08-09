import { NavLink } from "react-router-dom";
import { sidebarLinks } from "../../constants/sidebar";
import { useSidebar } from "../../context/SidebarContext";
import { FiX } from "react-icons/fi";

export default function Sidebar() {
  const { open, setOpen } = useSidebar();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
fixed
left-0
top-0
z-50
h-screen
w-64
bg-slate-900
text-white
transition-transform
duration-300

${open ? "translate-x-0" : "-translate-x-full"}

lg:static
lg:translate-x-0
`}
      >
        <div className="flex items-center justify-between border-b border-slate-700 p-6">

          <div>

            <h1 className="text-3xl font-bold">
              EduTrack
            </h1>

            <p className="text-sm text-slate-400">
              Attendance System
            </p>

          </div>

          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
          >
            <FiX />
          </button>

        </div>

        <nav className="p-4">

          {sidebarLinks.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `mb-2 flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                    isActive
                      ? "bg-indigo-600"
                      : "hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={20} />

                {item.title}

              </NavLink>
            );

          })}

        </nav>

      </aside>
    </>
  );
}