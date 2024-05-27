import { Component } from "react";
import { Navigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

import AuthService from "../services/auth.service";

type Props = {};

type State = {
  redirect: string | null,
  email: string,
  password: string,
  loading: boolean,
  message: string,
  showPassword: boolean
};

const API_URL = process.env.REACT_APP_API_URL;
const VAPID_PUBLIC_KEY = 'BCkfFHc2vl7Aq9EMEGEyklQrzqEPxouLvD__3iIwr7-nw0I2RddQKylE_5h5BWFrq2P_r7sHAk0ngUHgEKI0IFk';

export default class Login extends Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this);

    this.state = {
      redirect: null,
      email: "",
      password: "",
      loading: false,
      message: "",
      showPassword: false
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();

    if (currentUser) {
      this.setState({ redirect: "/profile" });
    }
  }

  validationSchema() {
    return Yup.object().shape({
      email: Yup.string().email("This is not a valid email.").required("This field is required!"),
      password: Yup.string().required("This field is required!"),
    });
  }

  togglePasswordVisibility() {
    this.setState((prevState) => ({
      showPassword: !prevState.showPassword
    }));
  }

  async handleLogin(formValue: { email: string; password: string }) {
    const { email, password } = formValue;

    this.setState({
      message: "",
      loading: true
    });

    try {
      await AuthService.login(email, password);
      console.log("Login successful");
      const currentUser = AuthService.getCurrentUser(); // Retrieve current user details
      await this.subscribeUserToPush(currentUser.id); // Pass the user ID to the subscription function
      this.setState({ redirect: "/profile" });
     // window.location.reload();
    } catch (error) {
      let resMessage = "An error occurred";
      if (error instanceof Error) {
        resMessage = error.message;
      } else if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as any;
        resMessage =
          (err.response && err.response.data && err.response.data.message) ||
          err.message ||
          err.toString();
      }
      this.setState({
        loading: false,
        message: resMessage
      });
    }
  }


async subscribeUserToPush(userId: string) {
  try {
    console.log("Requesting service worker");
    const swRegistration = await navigator.serviceWorker.ready;
    console.log("Service worker ready");

    // Request Notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permission not granted for Notification');
    }

    // Subscribe to push notifications
    console.log("Subscribing to push notifications");
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Send subscription to the server
    console.log("Sending subscription to the server");
    await fetch(`${API_URL}/subscription/new`, {
      method: 'POST',
      body: JSON.stringify({ subscription, userId }), // Include userId in the request body
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("Subscription successful");
  } catch (error) {
    console.error('Failed to subscribe to push notifications', error);
  }
}


  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} />
    }

    const { loading, message, showPassword } = this.state;

    const initialValues = {
      email: "",
      password: "",
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
            onSubmit={this.handleLogin}
          >
            <Form>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Field name="email" type="email" className="form-control" />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="alert alert-danger"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-group">
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                  />
                  <div className="input-group-append">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={this.togglePasswordVisibility}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="alert alert-danger"
                />
              </div>

              <div className="form-group">
                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading && (
                    <span className="spinner-border spinner-border-sm"></span>
                  )}
                  <span>Login</span>
                </button>
              </div>

              {message && (
                <div className="form-group">
                  <div className="alert alert-danger" role="alert">
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

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
