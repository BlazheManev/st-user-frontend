import React, { Component } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import AuthService from "../services/auth.service";

type Props = {};

type State = {
  ime: string,
  priimek: string,
  email: string,
  password: string,
  roles: string[],
  successful: boolean,
  message: string
};

export default class Register extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.handleRegister = this.handleRegister.bind(this);

    this.state = {
      ime: "",
      priimek: "",
      email: "",
      password: "",
      roles: ["WORKER"], // Default role
      successful: false,
      message: ""
    };
  }

  validationSchema() {
    return Yup.object().shape({
      ime: Yup.string().required("This field is required!"),
      priimek: Yup.string().required("This field is required!"),
      email: Yup.string().email("This is not a valid email.").required("This field is required!"),
      password: Yup.string().min(6, "The password must be between 6 and 40 characters.").max(40, "The password must be between 6 and 40 characters.").required("This field is required!"),
      roles: Yup.array().of(Yup.string())
    });
  }

  handleRegister(formValue: { ime: string; priimek: string; email: string; password: string; roles: string[] }) {
    const { ime, priimek, email, password, roles } = formValue;

    this.setState({
      message: "",
      successful: false
    });

    AuthService.register(ime, priimek, email, password, roles).then(
      response => {
        this.setState({
          message: response.data.message,
          successful: true
        });
      },
      error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        this.setState({
          successful: false,
          message: resMessage
        });
      }
    );
  }

  render() {
    const { successful, message } = this.state;

    const initialValues = {
      ime: "",
      priimek: "",
      email: "",
      password: "",
      roles: ["WORKER"]
    };

    return (
      <div className="col-md-12">
        <div className="card card-container">
          <img
            src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
            alt="profile-img"
            className="profile-img-card"
          />

          <Formik
            initialValues={initialValues}
            validationSchema={this.validationSchema()}
            onSubmit={this.handleRegister}
          >
            <Form>
              {!successful && (
                <div>
                  <div className="form-group">
                    <label htmlFor="ime">First Name</label>
                    <Field name="ime" type="text" className="form-control" />
                    <ErrorMessage name="ime" component="div" className="alert alert-danger" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="priimek">Last Name</label>
                    <Field name="priimek" type="text" className="form-control" />
                    <ErrorMessage name="priimek" component="div" className="alert alert-danger" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <Field name="email" type="email" className="form-control" />
                    <ErrorMessage name="email" component="div" className="alert alert-danger" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <Field name="password" type="password" className="form-control" />
                    <ErrorMessage name="password" component="div" className="alert alert-danger" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="roles">Roles</label>
                    <Field name="roles" as="select" multiple={true} className="form-control">
                      <option value="WORKER">Worker</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MODERATOR">Moderator</option>
                    </Field>
                    <ErrorMessage name="roles" component="div" className="alert alert-danger" />
                  </div>

                  <div className="form-group">
                    <button type="submit" className="btn btn-primary btn-block">Sign Up</button>
                  </div>
                </div>
              )}

              {message && (
                <div className="form-group">
                  <div className={successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                    {message}
                  </div>
                </div>
              )}
            </Form>
          </Formik>
        </div>
      </div>
    );
  }
}
