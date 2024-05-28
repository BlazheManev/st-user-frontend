import React, { useEffect, useState } from 'react';
import '../styles/Home.css';
import Building from '../components/building.component';
import AuthService from '../services/auth.service';
import IUser from '../types/user.type';

const Home: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  return (
    <div className="home-container">
      <img src="/favicon.png" alt="Logo" className="home-logo" />
      <h1>Welcome to Tracker</h1>
      <p>Your ultimate solution for time tracking and QR code scanning for work.</p>
      {currentUser && <Building />}
    </div>
  );
};

export default Home;
