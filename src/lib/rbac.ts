export type Role = "CUSTOMER" | "EDITOR" | "ADMIN" | "SUPER_ADMIN";

export const ROLES: Record<Role, Role> = {
  CUSTOMER: "CUSTOMER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
};

export type Permission =
  | "view_public_content"
  | "download_purchased_media"
  | "manage_own_favorites"
  | "create_blog_posts"
  | "edit_blog_posts"
  | "delete_blog_posts"
  | "upload_media"
  | "manage_products"
  | "manage_orders"
  | "manage_discounts"
  | "configure_watermark"
  | "manage_homepage_sections"
  | "view_audit_logs"
  | "manage_users"
  | "manage_system_settings";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  CUSTOMER: [
    "view_public_content",
    "download_purchased_media",
    "manage_own_favorites",
  ],
  EDITOR: [
    "view_public_content",
    "download_purchased_media",
    "manage_own_favorites",
    "create_blog_posts",
    "edit_blog_posts",
  ],
  ADMIN: [
    "view_public_content",
    "download_purchased_media",
    "manage_own_favorites",
    "create_blog_posts",
    "edit_blog_posts",
    "delete_blog_posts",
    "upload_media",
    "manage_products",
    "manage_orders",
    "manage_discounts",
    "configure_watermark",
    "manage_homepage_sections",
    "view_audit_logs",
  ],
  SUPER_ADMIN: [
    "view_public_content",
    "download_purchased_media",
    "manage_own_favorites",
    "create_blog_posts",
    "edit_blog_posts",
    "delete_blog_posts",
    "upload_media",
    "manage_products",
    "manage_orders",
    "manage_discounts",
    "configure_watermark",
    "manage_homepage_sections",
    "view_audit_logs",
    "manage_users",
    "manage_system_settings",
  ],
};

export function hasPermission(userRole: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

export function isStaff(role?: string | null): boolean {
  return role === "EDITOR" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isAdmin(role?: string | null): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isSuperAdmin(role?: string | null): boolean {
  return role === "SUPER_ADMIN";
}
