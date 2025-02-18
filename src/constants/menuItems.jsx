import {
  CalendarOutlined,
  FileDoneOutlined,
  HistoryOutlined,
  PoweroffOutlined,
  ProfileOutlined,
  SwapOutlined,
  UserOutlined,
} from "@ant-design/icons";

// src/data/menuItems.ts
export const menuItems = [
  { key: "/", label: "Home", path: "/" },
  { key: "/about", label: "About", path: "/about" },
  { key: "/services", label: "Services", path: "/services" },
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
        roles: ["psychologist", "manager"],
      },
    ],
  },
  {
    key: "test",
    label: "Survey",
    path: "/test",
    roles: ["student", "psychologist"],
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
        roles: ["psychologist"],
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
    key: "/appointment",
    label: "Appointment",
    path: "/appointment",
    special: true,
    roles: ["psychologist", "student", "manager"],
  },
];

export const dropdownMenu = [
  {
    label: "Schedule",
    key: "/appointment",
    icon: <CalendarOutlined />,
    roles: ["student", "manager"],
  },
  {
    label: "Student Profile",
    key: "/student-profile",
    icon: <ProfileOutlined />,
    roles: ["student"],
  },
  {
    label: "Test Record",
    key: "/test-record",
    icon: <FileDoneOutlined />,
    roles: ["student"],
  },
  {
    label: "Appointment Record",
    key: "/appointment-record",
    icon: <HistoryOutlined />,
    roles: ["psychologist"],
  },
  {
    label: "Children Record",
    key: "/children-record",
    icon: <UserOutlined />,
    roles: ["parent"],
  },
  {
    label: "Patient Record",
    key: "/patient-record",
    icon: <UserOutlined />,
    roles: ["psychologist"],
  },
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
