import { lazy } from "react";
import { ManagerLayout } from "../layouts/ManagerLayout";
import { StandardLayout } from "../layouts/StandardLayout";
import { PrivateRoute } from "../components/PrivateRoute";
import Home from "../pages/Home";
import Dashboard from "../pages/manager/Dashboard";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
// import Service from "../pages/Service";
import Login from "../pages/Login";
import { Unauthorized } from "../pages/error/Unauthorized";
import Booking from "../pages/Booking";
import Program from "../pages/Program";
import Test from "../pages/Test";
import TestQuestion from "../pages/TestQuestion";
import AddProgram from "../pages/psycologist/AddProgram";
import UpdateProgram from "../pages/psycologist/UpdateProgram";
import CreateTest from "../pages/psycologist/CreateTest";
import StudentProfile from "../pages/student/StudentProfile";
import ParentProfile from "../pages/parent/ParentProfile";
import ParentCalendar from "../pages/parent/ParentCalendar";
import { Outlet } from "react-router-dom";
// import Appointment from "../pages/psycologist/Appointment";
import ChildrenRecord from "../pages/parent/ChildrenRecord";
import AppointmentRecord from "../pages/student/AppointmentRecord";
import TestRecord from "../pages/student/TestRecord";
// import PatientRecord from "../pages/psycologist/PatientRecord";
import UserManagement from "../pages/manager/UserManagement";
import SurveyManagement from "../pages/manager/SurveyManagement";
import NotFound from "../pages/error/NotFound";
import TestResult from "../pages/TestResult";
import Blog from "../pages/Blog";
import BlogDetail from "../pages/BlogDetail";
// import Application from "../pages/psycologist/Application";
import NotificationDetail from "../pages/NotificationDetail";
import PsychologistProfile from "../pages/psycologist/PsychologistProfile";
import WorkSchedule from "../pages/psycologist/WorkSchedule";
import ProgramManagement from "../pages/manager/ProgramManagement";
import UpdateSurvey from "../pages/psycologist/UpdateSurvey";

const Appointment = lazy(() => import("../pages/psycologist/Appointment"));

export const routes = [
  {
    path: "/",
    element: <StandardLayout />,
    children: [
      { index: true, element: <Home /> },
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
          { path: "test-result/:surveyId", element: <TestResult /> },
          { path: "program", element: <Program /> },
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
          { path: "psychologist-profile", element: <PsychologistProfile /> },
          { path: "register-work-date", element: <WorkSchedule /> },
          // { path: "application", element: <Application /> },
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
          { path: "update-survey", element: <UpdateSurvey /> },
          { path: "create-test", element: <CreateTest /> },
          // { path: "patient-record", element: <PatientRecord /> },
        ],
      },
      {
        path: "",
        element: (
          <PrivateRoute allowedRoles={["psychologist", "student", "manager"]}>
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
          <PrivateRoute allowedRoles={["parent"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: "children-record", element: <ChildrenRecord /> },
          { path: "parent-calendar", element: <ParentCalendar /> },
          { path: "parent-profile", element: <ParentProfile /> },
        ],
      },
      {
        path: "",
        element: (
          <PrivateRoute allowedRoles={["manager"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: "add-program", element: <AddProgram /> },
          { path: "update-program", element: <UpdateProgram /> },
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
      { path: "programs", element: <ProgramManagement /> },
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
