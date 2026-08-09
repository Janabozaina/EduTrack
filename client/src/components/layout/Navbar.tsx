import { useEffect, useRef, useState } from "react";
import { FiBell, FiMenu, FiLogOut, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { getNotifications } from "../../services/notification.service";
import { getUser, logout } from "../../services/auth.service";

export default function Navbar() {
  const { setOpen } = useSidebar();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("edutrack-read-notifications") || "{}") as Record<string, boolean>;
    } catch {
      return {};
    }
  });
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      loadNotifications();
    }
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const result = await getNotifications();
      if (result.success && result.data) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const unreadCount = notifications.filter((item) => !readNotifications[item.id]).length;

  const updateReadState = (nextState: Record<string, boolean>) => {
    setReadNotifications(nextState);
    localStorage.setItem("edutrack-read-notifications", JSON.stringify(nextState));
  };

  const markAsRead = (id: string) => {
    if (readNotifications[id]) return;
    const next = { ...readNotifications, [id]: true };
    updateReadState(next);
  };

  const markAllAsRead = () => {
    const next = notifications.reduce((acc, item) => {
      acc[item.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    updateReadState(next);
  };

  const toggleDropdown = () => {
    setDropdownOpen((open) => !open);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={() => setOpen(true)}>
          <FiMenu size={24} />
        </button>

        <div className="hidden items-center gap-3 rounded-lg border px-4 py-2 md:flex">
          <FiSearch />
          <input
            placeholder="Search..."
            className="outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={toggleDropdown}
            className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50"
          >
            <FiBell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 z-30 mt-3 w-[min(95vw,360px)] max-w-[360px] rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between gap-3 pb-3">
                <div>
                  <p className="text-sm font-semibold">Notifications</p>
                  <p className="text-xs text-slate-500">Recent activity from payments and attendance.</p>
                </div>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  disabled={unreadCount === 0}
                >
                  Mark all read
                </button>
              </div>

              {loadingNotifications ? (
                <div className="py-10 text-center text-slate-500">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No notifications yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((item) => {
                    const isRead = Boolean(readNotifications[item.id]);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => markAsRead(item.id)}
                        className={`flex w-full flex-col items-start gap-2 rounded-3xl border px-4 py-3 text-left transition ${
                          isRead ? "border-slate-200 bg-slate-50" : "border-indigo-100 bg-indigo-50"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          {!isRead && (
                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{item.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          {item.className && <span>{item.className}</span>}
                          {item.groupName && <span>{item.groupName}</span>}
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="hidden rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 md:inline-flex"
        >
          <FiLogOut className="mr-2" />
          Logout
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
            {user?.name?.[0] ?? "U"}
          </div>

          <div className="hidden md:block">
            <p className="font-semibold">{user?.name ?? "Administrator"}</p>
            <p className="text-xs text-gray-500">EduTrack Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
