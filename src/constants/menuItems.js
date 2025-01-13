export const privateMenuItems = [
  {
    key: "1",
    label: "Dashboard",
    permission: "view_dashboard",
  },
  {
    key: "2",
    label: "User Management",
    permission: ["manage_users", "view_users"],
    children: [
      {
        key: "2-1",
        label: "Create User",
        permission: "create_user",
      },
      {
        key: "2-2",
        label: "View Users",
        permission: "view_users",
      },
    ],
  },
];
