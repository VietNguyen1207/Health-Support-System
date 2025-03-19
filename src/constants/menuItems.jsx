import {
  FileDoneOutlined,
  // FileOutlined,
  HistoryOutlined,
  PoweroffOutlined,
  // ProfileOutlined,
  SwapOutlined,
  UserOutlined,
} from "@ant-design/icons";

// src/data/menuItems.ts
export const menuItems = [
  { key: "/", label: "Home", path: "/" },
  { key: "/about", label: "About", path: "/about" },
  // { key: "/services", label: "Services", path: "/services" },
  { key: "/blog", label: "Blog", path: "/blog" },
  {
    key: "program",
    label: "Program",
    path: "/program",
    roles: ["psychologist", "manager", "student"],
    children: [
      {
        key: "/program",
        label: "Program List",
        path: "/program",
        // roles: ["psychologist", "manager", "student"],
      },
      {
        key: "/add-program",
        label: "Add Program",
        path: "/add-program",
        roles: ["manager"],
      },
      {
        key: "/update-program",
        label: "Update Program",
        path: "/update-program",
        roles: ["manager"],
      },
    ],
  },
  {
    key: "test",
    label: "Survey",
    path: "/test",
    roles: ["student", "psychologist", "manager"],
    children: [
      {
        key: "/test",
        label: "Survey List",
        path: "/test",
        roles: ["psychologist", "student", "manager"],
      },
      {
        key: "/create-test",
        label: "Create New Survey",
        path: "/create-test",
        roles: ["psychologist", "manager"],
      },
    ],
  },
  {
    key: "/book-appointment",
    label: "Book Now",
    path: "/book-appointment",
    special: true,
    roles: ["student"],
  },
  {
    key: "/calendar",
    label: "Appointment",
    path: "/calendar",
    special: true,
    roles: ["psychologist"],
  },
];

export const dropdownMenu = [
  {
    label: "Test Record",
    key: "/test-record",
    icon: <FileDoneOutlined />,
    roles: ["student"],
  },
  // {
  //   label: "Application",
  //   key: "/application",
  //   icon: <FileOutlined />,
  //   roles: ["psychologist"],
  // },
  {
    label: "Work Schedule",
    key: "/register-work-date",
    icon: <HistoryOutlined />,
    roles: ["psychologist"],
  },
  {
    label: "Appointment Record",
    key: "/appointment-record",
    icon: <HistoryOutlined />,
    roles: ["psychologist", "student"],
  },
  // {
  //   label: "Children Record",
  //   key: "/children-record",
  //   icon: <UserOutlined />,
  //   roles: ["parent"],
  // },
  // {
  //   label: "Patient Record",
  //   key: "/patient-record",
  //   icon: <UserOutlined />,
  //   roles: ["psychologist"],
  // },
  {
    label: "Dashboard",
    key: "dashboard",
    icon: <SwapOutlined />,
    roles: ["manager"],
  },
  {
    label: "Logout",
    key: "logout",
    icon: <PoweroffOutlined />,
    danger: true,
  },
];
