import React, { useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Layouts from "./components/Layouts";
import { UserProvider } from "./Context/Context.jsx";
import AuthRoute from "./ProtectedRoutes/AuthRoute.jsx";

const App = () => {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const isVerified = localStorage.getItem("recaptchaVerified");
    if (isVerified === "true") setVerified(true);
  }, []);

  const handleCaptcha = (token) => {
    if (token) setVerified(true);
    localStorage.setItem("recaptchaVerified", "true");
  };
  return (
    <div
      className=" min-h-screen flex items-center justify-center 
  "
    >
      {!verified ? (
        <div className="text-center space-y-4">
          <h1 className="text-xl text-white font-bold">
            Please verify you're human
          </h1>
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_SITE_KEY}
            onChange={handleCaptcha}
          />
        </div>
      ) : (
        <Routes>
          <Route
            element={
              <UserProvider>
                <Layouts />
              </UserProvider>
            }
          >
            <Route path="/" index element={<Home />} />
            <Route
              path="/chat"
              element={
                <AuthRoute>
                  <Chat />{" "}
                </AuthRoute>
              }
            />
          </Route>
        </Routes>
      )}
    </div>
  );
};

export default App;
