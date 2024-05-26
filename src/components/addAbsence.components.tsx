import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/auth.service';
import authHeader from '../services/auth-header';
import '../styles/AddAbsence.css'; // Create and import a CSS file for styling
import { eachDayOfInterval } from 'date-fns';

interface Vacation {
  _id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

interface Absence {
  _id: string;
  userId: string;
  ime: string;
  priimek: string;
  vacations: Vacation[];
  year: number;
}

const AddAbsence: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [remainingDays, setRemainingDays] = useState(0);

  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchAbsences(currentUser.id);
      fetchRemainingDays(currentUser.id);
    }
  }, [currentUser]); // Only call when currentUser changes

  const fetchAbsences = async (userId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/absence/user/${userId}`, { headers: authHeader() });
      setAbsences(response.data);
    } catch (error) {
      console.error('Error fetching absences:', error);
    }
  };

  const fetchRemainingDays = async (userId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/users/get/${userId}`, { headers: authHeader() });
      setRemainingDays(response.data.vacationDaysLeft);
    } catch (error) {
      console.error('Error fetching remaining days:', error);
    }
  };

  const handleAddAbsence = async (event: React.FormEvent) => {
    event.preventDefault();

    if (currentUser && currentUser.id) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const vacationDaysRequested = eachDayOfInterval({
        start,
        end
      }).filter(date => date.getDay() !== 0 && date.getDay() !== 6).length;

      if (vacationDaysRequested > remainingDays) {
        setMessage('Not enough vacation days left.');
        return;
      }

      const absenceData = {
        userId: currentUser.id,
        startDate,
        endDate,
        reason,
        status: 'waiting for approval', // Set initial status
      };

      try {
        await axios.post(
          'http://localhost:3000/absence/create/new',
          absenceData,
          { headers: authHeader() }
        );
        setMessage('Absence added successfully!');
        fetchAbsences(currentUser.id); // Refresh the absences list
        fetchRemainingDays(currentUser.id); // Refresh the remaining days
      } catch (error) {
        setMessage('Error adding absence. Please try again.');
        console.error('Error adding absence:', error);
      }
    } else {
      setMessage('You need to log in to add an absence.');
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">Add Absence</h2>
      <form onSubmit={handleAddAbsence}>
        <div className="form-group">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            className="form-control"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            className="form-control"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reason">Reason:</label>
          <input
            type="text"
            className="form-control"
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Add Absence
        </button>
      </form>
      {message && <div className="alert alert-info mt-3">{message}</div>}
      <h3 className="mt-4">My Absences</h3>
      <div className="absence-list">
        {absences.map((absence) => (
          <div key={absence._id} className="absence-card card mb-3">
            <div className="card-body">
              <h5 className="card-title">{absence.ime} {absence.priimek}</h5>
              {absence.vacations.map((vacation) => (
                <div key={vacation._id} className="vacation-details">
                  <p><strong>From:</strong> {new Date(vacation.startDate).toLocaleDateString()}</p>
                  <p><strong>To:</strong> {new Date(vacation.endDate).toLocaleDateString()}</p>
                  <p><strong>Reason:</strong> {vacation.reason}</p>
                  <p>
                    <strong>Status:</strong> 
                    <span className={`status status-${vacation.status.replaceAll(' ', '-')}`}>
                      {vacation.status}
                    </span>
                  </p>
                </div>
              ))}
              <p className="card-text"><strong>Year:</strong> {absence.year}</p>
            </div>
          </div>
        ))}
      </div>
      <h3 className="mt-4">Remaining Vacation Days: {remainingDays}</h3>
    </div>
  );
};

export default AddAbsence;
