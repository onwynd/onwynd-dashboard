import { create } from "zustand";
import { rolesService, Role, Permission } from "@/lib/api/roles";

interface RolesState {
  roles: Role[];
  permissions: Permission[];
  isLoading: boolean;
  fetchRoles: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
  lastError: string | null;
}

export const useRolesStore = create<RolesState>((set) => ({
  roles: [],
  permissions: [],
  isLoading: false,
  lastError: null,

  fetchRoles: async () => {
    set({ isLoading: true });
    try {
      const data = await rolesService.getRoles();
      // Ensure we handle both wrapped and unwrapped responses
      const roles = Array.isArray(data) ? data : data.data || [];
      set({ roles, lastError: null });
    } catch (error) {
      const message = (error as Error)?.message || "Failed to fetch roles";
      set({ lastError: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPermissions: async () => {
    try {
      const data = await rolesService.getPermissions();
      const permissions = Array.isArray(data) ? data : data.data || [];
      set({ permissions, lastError: null });
    } catch (error) {
      const message = (error as Error)?.message || "Failed to fetch permissions";
      set({ lastError: message });
    }
  },
}));
