import { useState, useEffect } from "react";
import { MenuItem } from "@/types/menu";
import { MenuService } from "@/services/menu-service";

export function useMenus() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data = await MenuService.getMenus();
        
        if (data && data.length > 0) {
          setMenus(data);
        } else {
          setMenus([]);
        }
      } catch (err) {
        console.error("[Sidebar] Lỗi khi load menu:", err);
        setMenus([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenus();
  }, []);

  return { menus, isLoading };
}
