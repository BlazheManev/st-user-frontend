import React, { useEffect, useState } from 'react';
import '../styles/Home.css';
import Building from '../components/building.component';
import AuthService from '../services/auth.service';
import IUser from '../types/user.type';
import VoiceCommand from '../VoiceCommand';

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
      {currentUser &&  <div className="voice-command-explanation">
        <h2>Voice Command Usage</h2>
        <p>You can control the app using voice commands. Here are some examples:</p>
        <ul>
          <li>Say "Home" to navigate to the home page.</li>
          <li>Say "QR" to display your QR code.</li>
          <li>Say "Go to the calendar" to open the calendar.</li>
          <li>Say "Install the app" to initiate the app installation.</li>
        </ul>
        <p>Click the button below to start using voice commands:</p>
        <VoiceCommand />
      </div>
    }
      {currentUser && <Building />}
    </div>
  );
};

export default Home;
