import { useEffect, useRef, useState } from "react";
import {
  FiBell,
  FiMenu,
  FiLogOut,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

import { useSidebar } from "../../context/SidebarContext";
import { getNotifications } from "../../services/notification.service";
import { getUser, logout } from "../../services/auth.service";

export default function Navbar() {
  const { setOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<{ name: string } | null>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [readNotifications, setReadNotifications] = useState<
    Record<string, boolean>
  >(() => {
    try {
      return JSON.parse(
        localStorage.getItem("edutrack-read-notifications") || "{}"
      ) as Record<string, boolean>;
    } catch {
      return {};
    }
  });

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  // Keep search synced with URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.search]);

  // Close notification dropdown when clicking outside
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchRef.current?.focus();
      }, 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      loadNotifications();
    }
  }, [dropdownOpen]);

  const handleSearchSubmit = () => {
    const value = search.trim();

    const params = new URLSearchParams();

    if (value) {
      params.set("search", value);
    }

    navigate({
      pathname: "/students",
      search: params.toString(),
    });

    setSearchOpen(false);
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearchSubmit();
    }

    if (event.key === "Escape") {
      setSearchOpen(false);
    }
  };

  const clearSearch = () => {
    setSearch("");

    if (location.pathname === "/students") {
      navigate(
        {
          pathname: "/students",
          search: "",
        },
        { replace: true }
      );
    }

    setSearchOpen(false);
  };

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

  const unreadCount = notifications.filter(
    (item) => !readNotifications[item.id]
  ).length;

  const updateReadState = (nextState: Record<string, boolean>) => {
    setReadNotifications(nextState);

    localStorage.setItem(
      "edutrack-read-notifications",
      JSON.stringify(nextState)
    );
  };

  const markAsRead = (id: string) => {
    if (readNotifications[id]) return;

    const next = {
      ...readNotifications,
      [id]: true,
    };

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
    <header className="sticky top-0 z-40 flex h-16 min-w-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 shadow-sm sm:px-4 lg:px-6">
      {/* LEFT SIDE */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {/* Mobile menu */}
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <FiMenu size={21} />
        </button>

        {/* Desktop Search */}
        <div className="hidden min-w-0 max-w-md flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 sm:flex md:max-w-lg">
          <FiSearch className="shrink-0 text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search students..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />

          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="shrink-0 text-slate-400 transition hover:text-slate-700"
              aria-label="Clear search"
            >
              <FiX size={17} />
            </button>
          )}
        </div>
</div>
{/* Mobile Search */}
<div className="sm:hidden">
  {!searchOpen ? (
    <button
      type="button"
      onClick={() => setSearchOpen(true)}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
      aria-label="Search"
    >
      <FiSearch size={20} />
    </button>
  ) : (
    <div className="fixed left-3 right-3 top-[68px] z-50 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
      <FiSearch className="ml-2 shrink-0 text-slate-400" />

      <input
        ref={searchRef}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleSearchKeyDown}
        placeholder="Search students..."
        className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none"
      />

      <button
        type="button"
        onClick={clearSearch}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Close search"
      >
        <FiX size={17} />
      </button>
    </div>
  )}
</div>



      {/* RIGHT SIDE */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={toggleDropdown}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
            aria-label="Notifications"
          >
            <FiBell size={21} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 z-50 mt-3 w-[calc(100vw-24px)] max-w-[360px] rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between gap-3 pb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    Notifications
                  </p>

                  <p className="text-xs text-slate-500">
                    Recent activity from payments and attendance.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  disabled={unreadCount === 0}
                >
                  Mark all read
                </button>
              </div>

              {loadingNotifications ? (
                <div className="py-10 text-center text-slate-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No notifications yet.
                </div>
              ) : (
                <div className="max-h-[60vh] space-y-3 overflow-y-auto">
                  {notifications.map((item) => {
                    const isRead = Boolean(readNotifications[item.id]);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => markAsRead(item.id)}
                        className={`flex w-full flex-col items-start gap-2 rounded-3xl border px-4 py-3 text-left transition ${
                          isRead
                            ? "border-slate-200 bg-slate-50"
                            : "border-indigo-100 bg-indigo-50"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {item.title}
                          </p>

                          {!isRead && (
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600" />
                          )}
                        </div>

                        <p className="text-sm text-slate-600">
                          {item.description}
                        </p>

                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          {item.className && <span>{item.className}</span>}
                          {item.groupName && <span>{item.groupName}</span>}

                          <span>
                            {new Date(
                              item.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 md:hidden"
          aria-label="Logout"
        >
          <FiLogOut size={19} />
        </button>

        {/* Desktop Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="hidden rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 md:inline-flex md:items-center"
        >
          <FiLogOut className="mr-2" />
          Logout
        </button>

        {/* User */}
        <div className="flex shrink-0 items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
            {user?.name?.[0] ?? "U"}
          </div>

          <div className="ml-3 hidden lg:block">
            <p className="font-semibold text-slate-900">
              {user?.name ?? "Administrator"}
            </p>

            <p className="text-xs text-gray-500">
              EduTrack Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
