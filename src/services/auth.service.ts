import axios from 'axios';
import { jwtDecode } from "jwt-decode";
const API_URL2 = process.env.REACT_APP_API_URL;

const API_URL = `${API_URL2}/users/`;

class AuthService {
  register(ime: string, priimek: string, email: string, password: string, wagePerHour: number, roles: string[]) {
    return axios.post(API_URL, {
      ime,
      priimek,
      email,
      password,
      wagePerHour, // Include wagePerHour
      roles
    });
  }

  login(email: string, password: string) {
    return axios.post(API_URL + 'login', {
      email,
      password
    }).then(response => {
      if (response.data.token) {
        const token = response.data.token;
        const decodedToken: any = jwtDecode(token);
        const user = {
          id: decodedToken.userId,
          email: decodedToken.email,
          roles: decodedToken.roles,
          accessToken: token
        };
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    });
  }

  logout() {
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);

    return null;
  }
}

export default new AuthService();
