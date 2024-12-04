import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { LoginPage } from "./pages/loginPage/index.js";
import { RegistrationPage } from "./pages/regPage/index.jsx";
import { HomePage } from "./pages/homePage/index.jsx";

const isAuthenticated = () => {
  return localStorage.getItem("authToken") !== null;
};

const LogOut =() => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  return <Navigate to="/login" />
}

const ProtectedRoute = ({ children }) => {
  const isAuth = isAuthenticated();
  const isAuthPage = ["LoginPage", "RegistrationPage"].includes(children.type.name);

  if (isAuth && isAuthPage) {
    return <Navigate to="/" />;
  }

  return isAuth ? children : <Navigate to="/login" />;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage/>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/logout" element={<LogOut/>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
