import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import "./App.css";
import "./index.css";
import About from "./pages/About";
import Login from "./pages/Login";
import Service from "./pages/Service";
import Booking from "./pages/Booking";
import Footer from "./components/Footer";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book-appointment" element={<Booking />} />
        <Route path="/services" element={<Service />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
