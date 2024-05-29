import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import axios from "axios";
import { Employee } from "../types/employee.model"; // Adjust the path as necessary

type Props = {};
const API_URL = process.env.REACT_APP_API_URL

type State = {
  redirect: string | null;
  userReady: boolean;
  currentEmployee: Employee | null;
};

export default class Profile extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      redirect: null,
      userReady: false,
      currentEmployee: null,
    };
  }

  async componentDidMount() {
    const currentUser = AuthService.getCurrentUser();
    console.log(currentUser);

    if (!currentUser) {
      this.setState({ redirect: "/" });
    } else {
      try {
        const response = await axios.get(`${API_URL}/users/get/${currentUser.id}`, {
          headers: {
            Authorization: `Bearer ${currentUser.accessToken}`,
          },
        });

        if (response.data) {
          this.setState({ currentEmployee: response.data, userReady: true });
        }
      } catch (error) {
        console.error("There was an error fetching the employee!", error);
        this.setState({ redirect: "/" });
      }
    }
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} />;
    }

    const { currentEmployee } = this.state;

    return (
      <div className="container">
        {this.state.userReady && currentEmployee ? (
          <div>
            <header className="jumbotron">
              <h3>
                <strong>{currentEmployee.email}</strong> Profile
              </h3>
            </header>
            <p>
              <strong>Id:</strong> {currentEmployee._id}
            </p>
            <p>
              <strong>Name:</strong> {currentEmployee.ime} {currentEmployee.priimek}
            </p>
            <p>
              <strong>Email:</strong> {currentEmployee.email}
            </p>
            <p>
              <strong>Roles:</strong>{" "}
              {currentEmployee.roles.map((role, index) => (
                <span key={index}>{role} </span>
              ))}
            </p>
            <p>
              <strong>Wage Per Hour:</strong> {currentEmployee.wagePerHour}
            </p>
            <p>
              <strong>Vacation Days Left:</strong> {currentEmployee.vacationDaysLeft}
            </p>
            <p>
              <strong>Education:</strong>{" "}
              {currentEmployee.education.map((edu, index) => (
                <div key={index}>
                  <p>Institution: {edu.institution}</p>
                  <p>Grade: {edu.grade}</p>
                  <p>Title: {edu.title}</p>
                </div>
              ))}
            </p>
          </div>
        ) : null}
      </div>
    );
  }
}
