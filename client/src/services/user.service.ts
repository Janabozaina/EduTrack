import api from "./api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export async function getProfile() {
  const { data } = await api.get<{ success: boolean; data: { user: UserProfile } }>(
    "/user/profile"
  );
  return data;
}

export async function updateProfile(name: string, email: string) {
  const { data } = await api.put<{ success: boolean; message: string; data: { user: UserProfile } }>(
    "/user/profile",
    { name, email }
  );
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data } = await api.put<{ success: boolean; message: string }>(
    "/user/password",
    { currentPassword, newPassword }
  );
  return data;
}
