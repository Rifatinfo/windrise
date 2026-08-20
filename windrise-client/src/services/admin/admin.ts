import type { Admin, AdminStatus } from "@/types/admin";
import { STAFF_ROLES, type StaffRoleKey } from "@/types/staffRole";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type ApiListResponse<T> = {
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  data: T;
};

export type GetAdminsParams = {
  /** Which staff role to list. Defaults to ADMIN. */
  role?: StaffRoleKey;
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

export type CreateAdminPayload = {
  name: string;
  email: string;
  password: string;
};

export type UpdateAdminPayload = {
  name?: string;
  email?: string;
};

async function handleError(res: Response): Promise<never> {
  const error = await res.json().catch(() => ({}));
  throw new Error(error.message ?? `Request failed with status ${res.status}`);
}

export async function getAllAdmins(
  params?: GetAdminsParams
): Promise<ApiListResponse<Admin[]>> {
  const query = new URLSearchParams({ role: params?.role ?? "ADMIN" });
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    }
  }
  const qs = query.toString();
  const res = await fetch(`${API_URL}/api/v1/user${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

/** Creates any staff role using that role's own endpoint. */
export async function createStaff(
  role: StaffRoleKey,
  payload: CreateAdminPayload,
  file?: File | null
): Promise<ApiListResponse<Admin>> {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));
  if (file) formData.append("file", file);

  const res = await fetch(`${API_URL}${STAFF_ROLES[role].createPath}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

export async function createAdmin(
  payload: CreateAdminPayload,
  file?: File | null
): Promise<ApiListResponse<Admin>> {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));
  if (file) formData.append("file", file);

  const res = await fetch(`${API_URL}/api/v1/user/create-admin`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

export async function updateAdmin(
  id: string,
  payload: UpdateAdminPayload,
  file?: File | null
): Promise<ApiListResponse<Admin>> {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));
  if (file) formData.append("file", file);

  const res = await fetch(`${API_URL}/api/v1/user/${id}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

export async function updateAdminStatus(
  id: string,
  status: AdminStatus
): Promise<ApiListResponse<Admin>> {
  const res = await fetch(`${API_URL}/api/v1/user/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

export async function deleteAdmin(id: string): Promise<ApiListResponse<Admin>> {
  const res = await fetch(`${API_URL}/api/v1/user/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) await handleError(res);
  return res.json();
}
