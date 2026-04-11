import { MenuItem } from "@/types/menu";
import { api } from "@/services/api-client";

export const MenuService = {
  async getMenus(): Promise<MenuItem[]> {
    try {
      return await api.get<MenuItem[]>("/menus/me");
    } catch (error) {
      console.error("[MenuService] Failed to fetch menus:", error);
      throw error;
    }
  },
};
