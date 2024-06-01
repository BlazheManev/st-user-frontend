import React, { Component } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";
import "./styles/Calendar.css"; // Add this line for calendar styles

import AuthService from "./services/auth.service";
import IUser from './types/user.type';

import Login from "./components/login.component";
import Register from "./components/register.component";
import Profile from "./components/profile.component";
import Calendar from "./components/calendar.component";
import Home from "./components/home.components";
import MyQRCode from "./components/myQR.component";
import AddAbsence from "./components/addAbsence.components"; // Import the AddAbsence component
import AllUsersCalendar from "./components/AllUsersCalendar"; // Import the new calendar component
import VacationApproval from "./components/VacationApproval"; // Import the VacationApproval component
import PrivateRoute from "./components/privateRoute"; // Import PrivateRoute
import VoiceCommand from "./VoiceCommand"; // Import VoiceCommand

import EventBus from "./common/EventBus";

type Props = {};

type State = {
  showModeratorBoard: boolean,
  showAdminBoard: boolean,
  currentUser: IUser | undefined
}

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
    };
  }

  componentDidMount() {
    const user = AuthService.getCurrentUser();

    if (user) {
      this.setState({
        currentUser: user,
        showModeratorBoard: user.roles?.includes("ROLE_MODERATOR"),
        showAdminBoard: user.roles?.includes("ROLE_ADMIN"),
      });
    }

    EventBus.on("logout", this.logOut);
  }

  componentWillUnmount() {
    EventBus.remove("logout", this.logOut);
  }

  logOut() {
    AuthService.logout();
    this.setState({
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
    });
  }

  render() {
    const { currentUser, showModeratorBoard, showAdminBoard } = this.state;

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
              {currentUser && currentUser.roles && (currentUser.roles.includes("ADMIN") || currentUser.roles.includes("MODERATOR")) && (
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
                    <a href="/login" className="nav-link" onClick={this.logOut}>
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
            <Route path="/register" element={<PrivateRoute roles={["ADMIN"]}><Register /></PrivateRoute>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/myQR" element={<MyQRCode />} />
            <Route path="/all-users-calendar" element={<AllUsersCalendar />} />
            <Route path="/addAbsence" element={<AddAbsence />} />
            <Route path="/vacation-approval" element={<VacationApproval />} />
          </Routes>
        </div>

        { /*<AuthVerify logOut={this.logOut}/> */}
      </div>
    );
  }
}

export default App;
