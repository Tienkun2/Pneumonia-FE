export interface Permission {
  name: string;
  description?: string;
  parentName?: string;
}

export interface PermissionTreeNode {
  name: string;
  description: string;
  isChecked: boolean;
  status?: string;
  createdAt?: string;
  children?: PermissionTreeNode[];
}
