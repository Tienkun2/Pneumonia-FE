export interface MenuItem {
  id: number;
  title: string;
  icon?: string;          
  url?: string;            
  permissionCode?: string; 
  items?: MenuItem[];     
}

export interface MenuApiResponse {
  code: number;
  message: string;
  result: MenuItem[];
}
