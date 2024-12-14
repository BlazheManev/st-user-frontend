import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";
import "./styles/Calendar.css";

import Hotjar from "@hotjar/browser"; // Import Hotjar
import AuthService from "./services/auth.service";
import IUser from "./types/user.type";

import Login from "./components/login.component";
import Register from "./components/register.component";
import Profile from "./components/profile.component";
import Calendar from "./components/calendar.component";
import Home from "./components/home.components";
import MyQRCode from "./components/myQR.component";
import AddAbsence from "./components/addAbsence.components";
import AllUsersCalendar from "./components/AllUsersCalendar";
import VacationApproval from "./components/VacationApproval";
import PrivateRoute from "./components/privateRoute";
import VoiceCommand from "./VoiceCommand";

import EventBus from "./common/EventBus";

// Import custom hook
import useHotjarTracker from "./services/HotjarTracker";

const App = () => {
  const [showModeratorBoard, setShowModeratorBoard] = useState(false);
  const [showAdminBoard, setShowAdminBoard] = useState(false);
  const [currentUser, setCurrentUser] = useState<IUser | undefined>(undefined);

  useHotjarTracker(); // Track route changes with Hotjar

  useEffect(() => {
    const siteId = 5227633;
    const hotjarVersion = 6;
    Hotjar.init(siteId, hotjarVersion); // Initialize Hotjar

    const user = AuthService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
      setShowModeratorBoard(user.roles?.includes("ROLE_MODERATOR") ?? false);
      setShowAdminBoard(user.roles?.includes("ROLE_ADMIN") ?? false);
    }

    EventBus.on("logout", logOut);

    return () => {
      EventBus.remove("logout", logOut);
    };
  }, []);

  const logOut = () => {
    AuthService.logout();
    setShowModeratorBoard(false);
    setShowAdminBoard(false);
    setCurrentUser(undefined);
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <Link to={"/"} className="navbar-brand">
          Tracker
        </Link>
        {currentUser && (
          <Link to={"/myQR"} className="navbar-brand">
            QR Code
          </Link>
        )}
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mr-auto">
            {currentUser && (
              <li className="nav-item">
                <Link to={"/calendar"} className="nav-link">
                  Calendar
                </Link>
              </li>
            )}
            {currentUser && (
              <li className="nav-item">
                <Link to={"/addAbsence"} className="nav-link">
                  Vacation
                </Link>
              </li>
            )}
            {currentUser && (
              <li className="nav-item">
                <Link to={"/all-users-calendar"} className="nav-link">
                  Absence Calendar
                </Link>
              </li>
            )}
            {currentUser &&
              currentUser.roles &&
              (currentUser.roles.includes("ADMIN") ||
                currentUser.roles.includes("MODERATOR")) && (
                <li className="nav-item">
                  <Link to={"/vacation-approval"} className="nav-link">
                    Vacation Approval
                  </Link>
                </li>
              )}
          </ul>
          <ul className="navbar-nav ml-auto">
            {currentUser ? (
              <>
                <li className="nav-item">
                  <Link to={"/profile"} className="nav-link">
                    {currentUser.email}
                  </Link>
                </li>
                {currentUser.roles && currentUser.roles.includes("ADMIN") && (
                  <li className="nav-item">
                    <Link to={"/register"} className="nav-link">
                      Sign Up
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <a
                    href="/login"
                    className="nav-link"
                    onClick={logOut}
                  >
                    LogOut
                  </a>
                </li>
                <li className="nav-item">
                  <VoiceCommand /> {/* Add VoiceCommand component here */}
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to={"/login"} className="nav-link">
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <div className="container mt-3">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/register"
            element={<PrivateRoute roles={["ADMIN"]}><Register /></PrivateRoute>}
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/myQR" element={<MyQRCode />} />
          <Route path="/all-users-calendar" element={<AllUsersCalendar />} />
          <Route path="/addAbsence" element={<AddAbsence />} />
          <Route path="/vacation-approval" element={<VacationApproval />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
