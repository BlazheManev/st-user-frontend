import React from 'react';
import '../styles/Home.css';
import Building from '../components/building.component';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <img src="/favicon.png" alt="Logo" className="home-logo" />
      <h1>Welcome to Tracker</h1>
      <p>Your ultimate solution for time tracking and QR code scanning for work.</p>
      <Building />
    </div>
  );
};

export default Home;
