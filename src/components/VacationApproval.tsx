import React, { useEffect, useState } from "react";
import axios from "axios";
import authHeader from "../services/auth-header";
import '../styles/CustomModal.css';

interface Absence {
  _id: string;
  userId: string;
  ime: string;
  priimek: string;
  vacations: Vacation[];
  businessTrips: BusinessTrip[];
  year: number;
}

interface Vacation {
  _id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

interface BusinessTrip {
  startDate: string;
  endDate: string;
  destination: string;
}

const VacationApproval = () => {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/absence/all", { headers: authHeader() })
      .then((response) => {
        setAbsences(response.data);
      })
      .catch((error) => {
        console.error("Error fetching absences:", error);
      });

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
  }, []);

  const approveVacation = (absenceId: string, vacationId: string) => {
    axios
      .post(`http://localhost:3000/absence/approve/${absenceId}/${vacationId}`, {}, { headers: authHeader() })
      .then(() => {
        setAbsences((prevAbsences) => prevAbsences.map((absence) => {
          if (absence._id === absenceId) {
            return {
              ...absence,
              vacations: absence.vacations.map((vacation) =>
                vacation._id === vacationId ? { ...vacation, status: "approved" } : vacation
              )
            };
          }
          return absence;
        }));
      })
      .catch((error) => {
        console.error("Error approving vacation:", error);
      });
  };

  const rejectVacation = (absenceId: string, vacationId: string) => {
    axios
      .post(`http://localhost:3000/absence/reject/${absenceId}/${vacationId}`, {}, { headers: authHeader() })
      .then(() => {
        setAbsences((prevAbsences) => prevAbsences.map((absence) => {
          if (absence._id === absenceId) {
            return {
              ...absence,
              vacations: absence.vacations.map((vacation) =>
                vacation._id === vacationId ? { ...vacation, status: "rejected" } : vacation
              )
            };
          }
          return absence;
        }));
      })
      .catch((error) => {
        console.error("Error rejecting vacation:", error);
      });
  };

  if (!currentUser || !(currentUser.roles.includes("ADMIN") || currentUser.roles.includes("MODERATOR"))) {
    return <div>You do not have access to this page.</div>;
  }

  return (
    <div className="approval-container">
      <h2>Vacation Approval</h2>
      {absences.map((absence) => (
        <div key={absence._id}>
          <h3>{absence.ime} {absence.priimek}</h3>
          {absence.vacations.filter(vacation => vacation.status === 'waiting for approval').map((vacation) => (
            <div key={vacation._id} className="vacation-event">
              <strong>Vacation:</strong> {vacation.reason} ({vacation.startDate} - {vacation.endDate})
              <div>
                <button onClick={() => approveVacation(absence._id, vacation._id)} className="btn btn-primary">Approve</button>
                <button onClick={() => rejectVacation(absence._id, vacation._id)} className="btn btn-danger">Reject</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default VacationApproval;
