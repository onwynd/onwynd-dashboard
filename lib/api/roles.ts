import client from "./client";

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: Permission[];
}

export const rolesService = {
  getRoles: async () => {
    const response = await client.get("/api/v1/admin/roles");
    return response.data.data ?? response.data;
  },

  createRole: async (data: { name: string; permissions?: string[] }) => {
    const response = await client.post("/api/v1/admin/roles", data);
    return response.data.data ?? response.data;
  },

  updateRole: async (id: number, data: { name: string; permissions?: string[] }) => {
    const response = await client.put(`/api/v1/admin/roles/${id}`, data);
    return response.data.data ?? response.data;
  },

  deleteRole: async (id: number) => {
    const response = await client.delete(`/api/v1/admin/roles/${id}`);
    return response.data.data ?? response.data;
  },

  getPermissions: async () => {
    const response = await client.get("/api/v1/admin/permissions");
    return response.data.data ?? response.data;
  }
};
