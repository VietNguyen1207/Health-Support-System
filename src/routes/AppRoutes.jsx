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
import { Unauthorized } from "../pages/Unauthorized";
import Booking from "../pages/Booking";

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
      { path: "dashboard", element: <Dashboard /> },
      { path: "book-appointment", element: <Booking /> },
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
      // {
      //   path: "student",
      //   element: (
      //     <PrivateRoute allowedRoles={["student"]}>
      //       {/* <StudentDashboard /> */}
      //     </PrivateRoute>
      //   ),
      // },
      // {
      //   path: "parent",
      //   element: (
      //     <PrivateRoute allowedRoles={["parent"]}>
      //       {/* <ParentDashboard /> */}
      //     </PrivateRoute>
      //   ),
      // },
      // {
      //   path: "psychologist",
      //   element: (
      //     <PrivateRoute allowedRoles={["psychologist"]}>
      //       <PsychologistDashboard />
      //     </PrivateRoute>
      //   ),
      // },
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
      //   { path: "users", element: <UserManagement /> },
      //   { path: "surveys", element: <SurveyManagement /> },
    ],
  },
];
