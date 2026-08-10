
import api from "./api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER";
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER";
  createdAt: string;
}

export interface UsersResponse {
  success: boolean;
  message?: string;
  data: AdminUser[];
}

export async function getProfile() {
  const { data } = await api.get<{
    success: boolean;
    data: { user: UserProfile };
  }>("/user/profile");

  return data;
}

export async function updateProfile(name: string, email: string) {
  const { data } = await api.put<{
    success: boolean;
    message: string;
    data: { user: UserProfile };
  }>("/user/profile", {
    name,
    email,
  });

  return data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const { data } = await api.put<{
    success: boolean;
    message: string;
  }>("/user/password", {
    currentPassword,
    newPassword,
  });

  return data;
}

// ================================
// Admin User Management
// ================================

export async function getAllUsers() {
  const { data } = await api.get<UsersResponse>("/user/admin/users");
  return data;
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: "ADMIN" | "TEACHER"
) {
  const { data } = await api.post<{
    success: boolean;
    message: string;
    data?: AdminUser;
  }>("/user/admin/users", {
    name,
    email,
    password,
    role,
  });

  return data;
}

export async function updateUser(
  id: string,
  name: string,
  email: string,
  role: "ADMIN" | "TEACHER"
) {
  const { data } = await api.put<{
    success: boolean;
    message: string;
    data?: AdminUser;
  }>(`/user/admin/users/${id}`, {
    name,
    email,
    role,
  });

  return data;
}

export async function deleteUser(id: string) {
  const { data } = await api.delete<{
    success: boolean;
    message: string;
  }>(`/user/admin/users/${id}`);

  return data;
}
