import { useState, useEffect } from "react";
import { MenuItem } from "@/types/menu";
import { MenuService } from "@/services/menu-service";

const SESSION_KEY = "dynamic_menus";

export function useMenus() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const cached = sessionStorage.getItem(SESSION_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMenus(parsed);
            setIsLoading(false);
            return;
          }
        }

        const data = await MenuService.getMenus();
        
        if (data && data.length > 0) {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
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
