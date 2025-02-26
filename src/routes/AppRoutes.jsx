import { lazy } from "react";
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
import Program from "../pages/Program";
import Test from "../pages/Test";
import TestQuestion from "../pages/TestQuestion";
import AddProgram from "../pages/psycologist/AddProgram";
import CreateTest from "../pages/psycologist/CreateTest";
import StudentProfile from "../pages/student/StudentProfile";
import { Outlet } from "react-router-dom";
// import Appointment from "../pages/psycologist/Appointment";
import ChildrenRecord from "../pages/parent/ChildrenRecord";
import AppointmentRecord from "../pages/student/AppointmentRecord";
import TestRecord from "../pages/student/TestRecord";
import PatientRecord from "../pages/psycologist/PatientRecord";
import UserManagement from "../pages/manager/UserManagement";
import SurveyManagement from "../pages/manager/SurveyManagement";
import NotFound from "../pages/error/NotFound";
import TestResult from "../pages/TestResult";
import Blog from "../pages/Blog";
import BlogDetail from "../pages/BlogDetail";
import Application from "../pages/psycologist/Application";
import ApplicationManagement from "../pages/manager/ApplicationManagement ";
import NotificationDetail from "../pages/NotificationDetail";

const Appointment = lazy(() => import("../pages/psycologist/Appointment"));

export const routes = [
  {
    path: "/",
    element: <StandardLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "contact", element: <Contact /> },
      { path: "about", element: <About /> },
      { path: "services", element: <Service /> },
      { path: "program", element: <Program /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/:id", element: <BlogDetail /> },
      {
        path: "",
        element: (
          <PrivateRoute requiresGuest>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <Register />,
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />,
          },
        ],
      },
      {
        path: "",
        element: (
          <PrivateRoute allowedRoles={["student", "manager"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: "student-profile", element: <StudentProfile /> },
          { path: "test-question", element: <TestQuestion /> },
          { path: "book-appointment", element: <Booking /> },
          { path: "test-record", element: <TestRecord /> },
          { path: "test-results", element: <TestResult /> },
          { path: "program", element: <Program /> },
        ],
      },
      {
        path: "",
        element: (
          <PrivateRoute allowedRoles={["psychologist", "manager"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: "application", element: <Application /> },
          { path: "add-program", element: <AddProgram /> },
          { path: "patient-record", element: <PatientRecord /> },
          { path: "create-test", element: <CreateTest /> },
        ],
      },
      {
        path: "",
        element: (
          <PrivateRoute allowedRoles={["psychologist", "manager", "student"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: "test", element: <Test /> },
          { path: "calendar", element: <Appointment /> },
          { path: "appointment-record", element: <AppointmentRecord /> },
          { path: "notifications/:id", element: <NotificationDetail /> },
        ],
      },
      {
        path: "",
        element: (
          <PrivateRoute allowedRoles={["parent", "manager"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [{ path: "children-record", element: <ChildrenRecord /> }],
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
        element: <UserManagement />,
      },
      { path: "surveys", element: <SurveyManagement /> },
      { path: "applications", element: <ApplicationManagement /> },
    ],
  },
  {
    path: "/notifications",
    element: <NotificationDetail />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
