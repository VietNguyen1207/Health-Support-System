import { ROLE_PERMISSIONS } from "../constants/permissions";
import { useAuthStore } from "../stores/authStore";

// Lấy role của user (thay thế bằng cách lấy từ authentication của bạn)
const getUserRole = () => {
  return useAuthStore.getState().user?.role || "";
};

// Lấy permissions dựa trên role
const getUserPermissions = () => {
  const role = getUserRole();
  return ROLE_PERMISSIONS[role] || [];
};

// Kiểm tra một permission cụ thể
const checkPermission = (permission) => {
  const userPermissions = getUserPermissions();
  return userPermissions.includes(permission);
};

// Kiểm tra nhiều permission
const checkPermissions = (permissions) => {
  const userPermissions = getUserPermissions();
  return permissions.every((permission) =>
    userPermissions.includes(permission)
  );
};

// Hàm lọc menu items dựa trên permission
const filterMenuItems = (items) => {
  return items.map((item) => {
    // Nếu không có permission requirement, giữ nguyên item
    if (!item.permission) {
      return item;
    }

    // Kiểm tra permission (có thể là string hoặc array)
    const permissions = Array.isArray(item.permission)
      ? item.permission
      : [item.permission];

    const hasPermission = checkPermissions(permissions);

    if (hasPermission) {
      return {
        ...item,
        children: item.children ? filterMenuItems(item.children) : undefined,
      };
    }

    // Nếu không có quyền, trả về item không có children
    return {
      ...item,
      children: undefined,
    };
  });
};

export {
  getUserRole,
  getUserPermissions,
  checkPermission,
  checkPermissions,
  filterMenuItems,
};
