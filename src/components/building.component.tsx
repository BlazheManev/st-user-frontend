import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Building.css';

interface User {
  userId: string;
  userName: string;
  entryTime: string;
}
const API_URL = process.env.REACT_APP_API_URL;

const Building: React.FC = () => {
  const [usersInBuilding, setUsersInBuilding] = useState<User[]>([]);

  useEffect(() => {
    axios.get(`${API_URL}/users/checkCurrentStatus`)
      .then(response => {
        setUsersInBuilding(response.data);
      })
      .catch(error => {
        console.error('Error fetching users in the building:', error);
      });
  }, []);

  return (
    <div className="building-container">
      <h2>Current Users in the Building</h2>
      <div className="building">
        {usersInBuilding.map(user => (
          <div key={user.userId} className="user-circle">
            <span>{user.userName}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Building;
