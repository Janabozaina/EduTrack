import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { getUser, setUser } from "../../services/auth.service";
import { changePassword, getProfile, updateProfile } from "../../services/user.service";

interface NotificationPreferences {
  paymentReminders: boolean;
  attendanceReminders: boolean;
  newStudentAlerts: boolean;
}

type ThemePreference = "system" | "light" | "dark";

const defaultNotifications: NotificationPreferences = {
  paymentReminders: true,
  attendanceReminders: true,
  newStudentAlerts: true,
};

const themeOptions: Array<{ label: string; value: ThemePreference }> = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

const notificationLabels: Array<{
  key: keyof NotificationPreferences;
  label: string;
}> = [
  { key: "paymentReminders", label: "Payment reminders" },
  { key: "attendanceReminders", label: "Attendance reminders" },
  { key: "newStudentAlerts", label: "New student notifications" },
];

function applyTheme(theme: ThemePreference) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [notifications, setNotifications] = useState<NotificationPreferences>(
    defaultNotifications
  );

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme-preference") as ThemePreference | null;
    setTheme(storedTheme || "system");

    const storedNotifications = localStorage.getItem("settings-notifications");
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch {
        setNotifications(defaultNotifications);
      }
    }

    const user = getUser();
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }

    loadUserProfile();
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  async function loadUserProfile() {
    try {
      const result = await getProfile();
      if (result.success && result.data.user) {
        setName(result.data.user.name);
        setEmail(result.data.user.email);
      }
    } catch (error: any) {
      console.error("Failed to load profile", error);
    } finally {
      setLoadingProfile(false);
    }
  }

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter both name and email.");
      return;
    }

    setSavingProfile(true);

    try {
      const result = await updateProfile(name.trim(), email.trim());

      if (!result.success) {
        toast.error(result.message || "Unable to update profile.");
        return;
      }

      if (result.data.user) {
        setUser(result.data.user);
      }

      toast.success("Profile updated successfully.");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to save profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const result = await changePassword(currentPassword, newPassword);
      if (!result.success) {
        toast.error(result.message || "Unable to change password.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully.");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleThemeChange = (value: ThemePreference) => {
    setTheme(value);
    localStorage.setItem("theme-preference", value);
  };

  const toggleNotification = (key: keyof NotificationPreferences) => {
    const next = {
      ...notifications,
      [key]: !notifications[key],
    };

    setNotifications(next);
    localStorage.setItem("settings-notifications", JSON.stringify(next));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500">
            Manage your profile, security settings, and preferences.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-xl font-semibold">Profile</h2>
                <p className="text-sm text-slate-500">
                  Update your name and email address.
                </p>
              </div>

              {loadingProfile ? (
                <div className="rounded-3xl bg-slate-50 p-6 text-slate-500">
                  Loading profile...
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    Full name
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </label>

                  <label className="block text-sm font-semibold text-slate-700">
                    Email address
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </label>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  disabled={savingProfile || loadingProfile}
                  onClick={handleSaveProfile}
                  className="w-full sm:w-auto"
                >
                  {savingProfile ? "Saving..." : "Save profile"}
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-xl font-semibold">Account & Security</h2>
                <p className="text-sm text-slate-500">
                  Change your account password securely.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Current password
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  New password
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Confirm new password
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  disabled={changingPassword}
                  onClick={handleChangePassword}
                  className="w-full sm:w-auto"
                >
                  {changingPassword ? "Updating..." : "Change password"}
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-xl font-semibold">Appearance</h2>
                <p className="text-sm text-slate-500">
                  Choose your preferred theme for the admin interface.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleThemeChange(option.value)}
                    className={`rounded-3xl border px-4 py-3 text-left text-sm transition ${
                      theme === option.value
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-600 hover:text-slate-900"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <p className="text-sm text-slate-500">
                Theme preference is saved locally and will be applied on this device.
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-xl font-semibold">School / Academy Information</h2>
                <p className="text-sm text-slate-500">
                  These fields are shown for future academy profile support. The current backend does not expose school details.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Academy Name
                  </label>
                  <Input value="Not supported" disabled />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    School Email
                  </label>
                  <Input value="Not supported" disabled />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Phone number
                  </label>
                  <Input value="Not supported" disabled />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Address
                  </label>
                  <Input value="Not supported" disabled />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-xl font-semibold">Notifications</h2>
                <p className="text-sm text-slate-500">
                  Control your notification preferences for reminders and alerts.
                </p>
              </div>

              <div className="space-y-3">
                {notificationLabels.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleNotification(item.key)}
                    className={`flex w-full items-center justify-between rounded-3xl border px-4 py-4 text-left transition ${
                      notifications[item.key]
                        ? "border-indigo-600 bg-indigo-50 text-slate-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-600"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-sm text-slate-500">
                        {notifications[item.key] ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                    <div
                      className={`h-6 w-14 rounded-full p-1 transition ${
                        notifications[item.key]
                          ? "bg-indigo-600"
                          : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full bg-white transition ${
                          notifications[item.key] ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-sm text-slate-500">
                These preferences are stored locally on this device and do not yet sync to the server.
              </p>
            </div>
          </Card>

          <Card>
            <div className="space-y-3">
              <div>
                <h2 className="text-xl font-semibold">System</h2>
                <p className="text-sm text-slate-500">
                  Application details and version information.
                </p>
              </div>

              <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Application</p>
                  <p className="font-semibold">EduTrack</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Version</p>
                  <p className="font-semibold">0.0.0</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="font-semibold">Active</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
