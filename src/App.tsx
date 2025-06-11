import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import DataSetup from "./pages/DataSetup";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Results from "./pages/Results";
import AdminPanel from "./pages/AdminPanel";
import PartyRegistration from "./pages/PartyRegistration";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Landing from "./pages/Landing";
import ElectionProcess from "./pages/ElectionProcess";
import { ElectionDataProvider } from "./context/ElectionDataContext";

function App() {
  // Set default states on first load
  useEffect(() => {
    // Only set defaults if they don't exist
    if (!localStorage.getItem("selectedDistrictId")) {
      localStorage.setItem("selectedDistrictId", "all-districts");
    }
    if (!localStorage.getItem("adminPanelStep")) {
      localStorage.setItem("adminPanelStep", "1");
    }
  }, []);

  return (
    <Router>
      <ElectionDataProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/*"
            element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow pt-20">
                  <Routes>
                    <Route path="/home" element={<Home />} />
                    {/* Data Setup page between Home and Admin Panel */}
                    <Route path="/data-setup" element={<DataSetup />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route
                      path="/party-registration"
                      element={<PartyRegistration />}
                    />
                    <Route
                      path="/ElectionProcess"
                      element={<ElectionProcess />}
                    />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />
        </Routes>
      </ElectionDataProvider>
    </Router>
  );
}

export default App;
