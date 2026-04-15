
// filepath: store/builder-store.ts
import { create } from "zustand";
import { salesService, Organization } from "@/lib/api/sales";

interface BuilderState {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  fetchOrganizations: () => Promise<void>;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  organizations: [],
  loading: true,
  error: null,

  fetchOrganizations: async () => {
    set({ loading: true });
    const { data, error } = await salesService.getManagedOrganizations();
    if (data) {
      set({ organizations: data, loading: false });
    } else {
      set({ loading: false, error: error });
    }
  },
}));
