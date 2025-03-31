import { lazy, Suspense } from "react";
import { ManagerLayout } from "../layouts/ManagerLayout";
import { StandardLayout } from "../layouts/StandardLayout";
import { PrivateRoute } from "../components/PrivateRoute";
import { Outlet } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const Register = lazy(() => import("../pages/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const Login = lazy(() => import("../pages/Login"));
const Unauthorized = lazy(() => import("../pages/error/Unauthorized"));
const Booking = lazy(() => import("../pages/Booking"));
const Program = lazy(() => import("../pages/Program"));
const Test = lazy(() => import("../pages/Test"));
const TestQuestion = lazy(() => import("../pages/TestQuestion"));
const CreateTest = lazy(() => import("../pages/psycologist/CreateTest"));
const StudentProfile = lazy(() => import("../pages/student/StudentProfile"));
const ParentProfile = lazy(() => import("../pages/parent/ParentProfile"));
const ParentCalendar = lazy(() => import("../pages/parent/ParentCalendar"));
const Appointment = lazy(() => import("../pages/psycologist/Appointment"));
const ChildrenRecord = lazy(() => import("../pages/parent/ChildrenRecord"));
const AppointmentRecord = lazy(() =>
  import("../pages/student/AppointmentRecord")
);
const TestRecord = lazy(() => import("../pages/student/TestRecord"));
const UserManagement = lazy(() => import("../pages/manager/UserManagement"));
// const SurveyManagement = lazy(() =>
//   import("../pages/manager/SurveyManagement")
// );
const NotFound = lazy(() => import("../pages/error/NotFound"));
const TestResult = lazy(() => import("../pages/TestResult"));
const Blog = lazy(() => import("../pages/Blog"));
const BlogDetail = lazy(() => import("../pages/BlogDetail"));
const NotificationDetail = lazy(() => import("../pages/NotificationDetail"));
const PsychologistProfile = lazy(() =>
  import("../pages/psycologist/PsychologistProfile")
);
const WorkSchedule = lazy(() => import("../pages/psycologist/WorkSchedule"));
// const ProgramManagement = lazy(() =>
//   import("../pages/manager/ProgramManagement")
// );
const UpdateSurvey = lazy(() => import("../pages/psycologist/UpdateSurvey"));
const AppointmentManagement = lazy(() =>
  import("../pages/manager/AppointmentManagement")
);
const UpdateProgram = lazy(() => import("../pages/psycologist/UpdateProgram"));
const AddProgram = lazy(() => import("../pages/psycologist/AddProgram"));

export const routes = [
  // Guest routes (Login, Register, etc)
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <PrivateRoute requiresGuest>
          <StandardLayout />
        </PrivateRoute>
      </Suspense>
    ),
    children: [
      {
        path: "",
        element: <Outlet />,
        children: [
          { index: true, element: <Login /> },
          { path: "register", element: <Register /> },
          { path: "forgot-password", element: <ForgotPassword /> },
        ],
      },
      { path: "unauthorized", element: <Unauthorized /> },
    ],
  },

  // Manager routes
  {
    path: "/manager",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <PrivateRoute allowedRoles={["manager"]}>
          <ManagerLayout />
        </PrivateRoute>
      </Suspense>
    ),
    children: [
      { path: "users", element: <UserManagement /> },
      // { path: "surveys", element: <SurveyManagement /> },
      // { path: "programs", element: <ProgramManagement /> },
      { path: "appointments", element: <AppointmentManagement /> },
      { path: "programs", element: <UpdateProgram /> },
      { path: "surveys", element: <UpdateSurvey /> },
      { path: "add-program", element: <AddProgram /> },
      { path: "create-test", element: <CreateTest /> },
    ],
  },

  // Standard layout routes (for authenticated users)
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <PrivateRoute>
          <StandardLayout />
        </PrivateRoute>
      </Suspense>
    ),
    children: [
      // Public routes within authenticated section
      {
        path: "blog",
        element: (
          <PrivateRoute
            allowedRoles={["student", "parent", "manager", "psychologist"]}
          >
            <Blog />
          </PrivateRoute>
        ),
      },
      {
        path: "blog/:articleId",
        element: (
          <PrivateRoute
            allowedRoles={["student", "parent", "manager", "psychologist"]}
          >
            <BlogDetail />
          </PrivateRoute>
        ),
      },
      { path: "unauthorized", element: <Unauthorized /> },

      // Role-specific routes
      {
        path: "",
        element: (
          <PrivateRoute
            allowedRoles={["student", "parent", "psychologist", "manager"]}
          >
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
          <PrivateRoute allowedRoles={["parent", "manager"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [{ path: "children-record", element: <ChildrenRecord /> }],
      },
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
];
