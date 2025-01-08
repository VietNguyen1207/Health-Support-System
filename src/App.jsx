import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import "./App.css";
import About from "./pages/About";
import Service from "./pages/Service";
import Footer from "./components/Footer";
import Contact from "./pages/Contact";
import Register from "./auth/Register";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/services" element={<Service />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
