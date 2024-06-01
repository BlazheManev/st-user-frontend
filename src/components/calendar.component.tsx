import React, { useCallback, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { EventApi, EventClickArg, DatesSetArg } from "@fullcalendar/core";
import { format, startOfMonth, endOfMonth } from 'date-fns';
import AuthService from "../services/auth.service";
import axios from 'axios';
import authHeader from '../services/auth-header';
import CustomModal from "./customModel.component";
import '../styles/Calendar.css';

const holidays = [
  '2024-01-01', '2024-02-08', '2024-04-21', '2024-04-22', '2024-05-01', '2024-05-02', '2024-06-25', '2024-08-15', '2024-10-31', '2024-11-01', '2024-12-25', '2024-12-26'
];

const isHoliday = (date: Date) => holidays.includes(format(date, 'yyyy-MM-dd'));

interface WorkingHour {
  datum: string;
  hours: number;
  minutes: number;
  seconds: number;
  isAbsent?: boolean;
  workFromHome?: boolean;
}

function Calendar() {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [totalWorkedHours, setTotalWorkedHours] = useState<string>("");
  const [totalEarnings, setTotalEarnings] = useState<string>("");
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string>("07:00:00");
  const [endTime, setEndTime] = useState<string>("15:00:00");
  const API_URL = process.env.REACT_APP_API_URL;

  const handleEvents = useCallback(
    (events: EventApi[]) => setCurrentEvents(events),
    []
  );

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    if (window.confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'?`)) {
      clickInfo.event.remove();
    }
  }, []);

  const fetchMonthlyEarnings = (startDate: string, endDate: string) => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && currentUser.id) {
      const userId = currentUser.id;
      const apiUrl = `${API_URL}/users/calculateMonthlyEarnings`;

      axios.post(apiUrl, { userId, startDate, endDate }, { headers: authHeader() })
        .then((response) => {
          setTotalWorkedHours(response.data.totalWorkedHours);
          setTotalEarnings(response.data.totalEarnings);
        }).catch((error) => {
          console.error("Error fetching earnings:", error);
        });
    }
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    const startDate = format(startOfMonth(arg.view.currentStart), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(arg.view.currentStart), 'yyyy-MM-dd');
    fetchMonthlyEarnings(startDate, endDate);
  };

  const addSickLeaveOrWorkFromHome = () => {
    if (!selectedDate || !selectedType) return;

    const currentUser = AuthService.getCurrentUser();
    if (currentUser && currentUser.id) {
      const userId = currentUser.id;
      const apiUrl = `${API_URL}/users/add-sick-leave-or-work-from-home/${userId}/`;

      const data: { date: string; type: string; startTime?: string; endTime?: string } = { date: selectedDate, type: selectedType };

      if (selectedType === "Work From Home") {
        data.startTime = startTime;
        data.endTime = endTime;
      }

      axios.post(apiUrl, data, { headers: authHeader() })
        .then((response) => {
          console.log(`${selectedType} added:`, response.data);
          alert(`${selectedType} recorded successfully!`);
          window.location.reload();
        }).catch((error) => {
          console.error(`Error adding ${selectedType.toLowerCase()}:`, error);
          alert(`Failed to record ${selectedType.toLowerCase()}.`);
        });
    }
  };

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && currentUser.id) {
      const userId = currentUser.id;
      const apiUrl = `${API_URL}/users/${userId}/working-hours`;

      axios.get(apiUrl, { headers: authHeader() }).then((response) => {
        setWorkingHours(response.data);
      }).catch((error) => {
        console.error("Error fetching working hours:", error);
      });
    }
  }, [API_URL]); 

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
    setModalIsOpen(true);
  };

  return (
    <div className="calendar-container">
      <div className="earnings-display">
        <h3>Monthly Summary</h3>
        <p><strong>Worked Hours:</strong> {totalWorkedHours}h</p>
        <p><strong>Monthly Earnings:</strong> ${totalEarnings}</p>
      </div>
      <div className="demo-app">
        <div className="demo-app-main">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            selectable={true}
            editable={false}
            locales={allLocales}
            locale="en"
            firstDay={1}
            eventsSet={handleEvents}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            dayCellContent={(day) => {
              const workingDay = workingHours.find((wh) => format(new Date(wh.datum), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd'));
              return workingDay ? `${day.dayNumberText} (${workingDay.hours}h ${workingDay.minutes}m)` : day.dayNumberText;
            }}
            dayCellClassNames={(date) => {
              const day = date.date.getDay();
              const workingDay = workingHours.find((wh) => format(new Date(wh.datum), 'yyyy-MM-dd') === format(date.date, 'yyyy-MM-dd'));
              if (isHoliday(date.date)) return 'holiday';
              if (day === 0) return 'sunday';
              if (day === 6) return 'saturday';
              if (workingDay && workingDay.isAbsent) return 'sick-day';
              if (workingDay && workingDay.workFromHome) return 'work-from-home-day';
              return '';
            }}
            dateClick={handleDateClick}
          />
        </div>
      </div>
      <CustomModal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)}>
        <h2>Select Type</h2>
        <div className="button-group">
          <button
            onClick={() => setSelectedType("Sick Leave")}
            className={selectedType === "Sick Leave" ? "selected" : ""}
          >
            Sick Leave
          </button>
          <button
            onClick={() => setSelectedType("Work From Home")}
            className={selectedType === "Work From Home" ? "selected" : ""}
          >
            Work From Home
          </button>
        </div>
        {selectedType === "Work From Home" && (
          <div className="time-inputs">
            <label>
              Start Time:
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </label>
            <label>
              End Time:
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </label>
          </div>
        )}
        <div className="modal-footer">
          <button onClick={addSickLeaveOrWorkFromHome}>Confirm</button>
        </div>
      </CustomModal>
    </div>
  );
}

export default Calendar;
