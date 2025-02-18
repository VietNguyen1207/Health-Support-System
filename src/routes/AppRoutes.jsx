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
import Appointment from "../pages/psycologist/Appointment";
import ChildrenRecord from "../pages/parent/ChildrenRecord";
import AppointmentRecord from "../pages/student/AppointmentRecord";
import TestRecord from "../pages/student/TestRecord";
import PatientRecord from "../pages/psycologist/PatientRecord";
import UserManagement from "../pages/manager/UserManagement";
import SurveyManagement from "../pages/manager/SurveyManagement";
import NotFound from "../pages/error/NotFound";
import TestResult from "../pages/TestResult";

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
          <PrivateRoute allowedRoles={["student"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: "student-profile", element: <StudentProfile /> },
          { path: "test-question", element: <TestQuestion /> },
          { path: "book-appointment", element: <Booking /> },
          // { path: "appointment", element: <Appointment /> },
          { path: "appointment-record", element: <AppointmentRecord /> },
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
<<<<<<< HEAD
          // { path: "appointment", element: <Appointment /> },
=======
>>>>>>> 1986374d8444a60409aeb490ee038668741390fa
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
        children: [{ path: "appointment", element: <Appointment /> }],
      },
      {
        path: "",
        element: (
          <PrivateRoute allowedRoles={["parent"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [{ path: "children-record", element: <ChildrenRecord /> }],
      },
      {
        path: "",
        element: (
          <PrivateRoute allowedRoles={["manager", "psychologist"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [{ path: "add-program", element: <AddProgram /> }],
      },
      {
        path: "",
        element: (
          <PrivateRoute allowedRoles={["student", "psychologist", "manager"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: "test", element: <Test /> },
          { path: "appointment", element: <Appointment /> },
        ],
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
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
