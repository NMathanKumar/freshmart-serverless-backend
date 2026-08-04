export interface Role {
  roleName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  permissionName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleMapping {
  roleName: string;
  permissionName: string;
  createdAt: string;
}
