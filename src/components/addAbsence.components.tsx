import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../services/auth.service';
import authHeader from '../services/auth-header';
import '../styles/AddAbsence.css'; // Create and import a CSS file for styling

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

  const TOTAL_VACATION_DAYS = 24; // Assume each user has 24 vacation days per year

  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchAbsences(currentUser.id);
    }
  }, [currentUser]);

  const fetchAbsences = async (userId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/absence/user/${userId}`, { headers: authHeader() });
      setAbsences(response.data);
      calculateRemainingDays(response.data);
    } catch (error) {
      console.error('Error fetching absences:', error);
    }
  };

  const calculateRemainingDays = (absences: Absence[]) => {
    let totalDaysTaken = 0;
    absences.forEach((absence) => {
      absence.vacations.forEach((vacation) => {
        const start = new Date(vacation.startDate);
        const end = new Date(vacation.endDate);
        const days = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1; // Include end date
        totalDaysTaken += days;
      });
    });
    const remaining = TOTAL_VACATION_DAYS - totalDaysTaken;
    setRemainingDays(remaining > 0 ? remaining : 0);
  };

  const handleAddAbsence = async (event: React.FormEvent) => {
    event.preventDefault();

    if (currentUser && currentUser.id) {
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
