import { ManagerLayout } from "../layouts/ManagerLayout";
import { StandardLayout } from "../layouts/StandardLayout";
import { PrivateRoute } from "../components/PrivateRoute";
import Home from "../pages/Home";
import Contact from "../pages/Contact";
import Dashboard from "../pages/manager/Dashboard";
import About from "../pages/About";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import Service from "../pages/Service";
import Login from "../pages/Login";
import { Unauthorized } from "../pages/error/Unauthorized";
import Booking from "../pages/Booking";
import Test from "../pages/Test";
import TestQuestion from "../pages/TestQuestion";
import { Outlet } from "react-router-dom";
import Appointment from "../pages/psycologist/Appointment";
import ChildrenRecord from "../pages/parent/ChildrenRecord";
import AppointmentRecord from "../pages/student/AppointmentRecord";
import TestRecord from "../pages/student/TestRecord";
import PatientRecord from "../pages/psycologist/PatientRecord";
import UserManagement from "../pages/manager/UserManagement";
import SurveyManagement from "../pages/manager/SurveyManagement";
import NotFound from "../pages/error/NotFound";
// import { PERMISSIONS } from "../utils/permissions";

export const routes = [
  {
    path: "/",
    element: <StandardLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "contact", element: <Contact /> },
      { path: "about", element: <About /> },
      { path: "services", element: <Service /> },
      { path: "contact", element: <Contact /> },
      // { path: "test", element: <Test /> },
      // { path: "test-question", element: <TestQuestion /> },
      // { path: "book-appointment", element: <Booking /> },
      // { path: "dashboard", element: <Dashboard /> },
      {
        path: "login",
        element: (
          <PrivateRoute requiresGuest>
            <Login />
          </PrivateRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PrivateRoute requiresGuest>
            <Register />
          </PrivateRoute>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <PrivateRoute requiresGuest>
            <ForgotPassword />
          </PrivateRoute>
        ),
      },
      {
        path: "",
        element: (
          <PrivateRoute allowedRoles={["student"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          // { path: "test", element: <Test /> },
          { path: "test-question", element: <TestQuestion /> },
          { path: "book-appointment", element: <Booking /> },
          { path: "appointment-record", element: <AppointmentRecord /> },
          { path: "test-record", element: <TestRecord /> },
        ],
      },
      {
        path: "",
        element: (
          <PrivateRoute allowedRoles={["psychologist"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: "appointment", element: <Appointment /> },
          { path: "patient-record", element: <PatientRecord /> },
        ],
      },
      {
        path: "",
        element: (
          <PrivateRoute allowedRoles={["parent"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: "children-record", element: <ChildrenRecord /> },
          // { path: "book-appointment", element: <Booking /> },
        ],
      },
      {
        path: "",
        element: (
          <PrivateRoute allowedRoles={["student", "psychologist"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [{ path: "test", element: <Test /> }],
      },
      { path: "unauthorized", element: <Unauthorized /> },
    ],
  },
  {
    path: "/manager",
    element: (
      <PrivateRoute allowedRoles={["manager"]}>
        <ManagerLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      {
        path: "users",
        element: (
          // <PrivateRoute allowedRoles={["manager"]}>
          <UserManagement />
          // </PrivateRoute>
        ),
      },
      { path: "surveys", element: <SurveyManagement /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
