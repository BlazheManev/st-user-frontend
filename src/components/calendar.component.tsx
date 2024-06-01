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
import '../styles/Calendar.css'; // Import the CSS file

const holidays = [
  '2024-01-01', '2024-02-08', '2024-04-21', '2024-04-22', '2024-05-01', '2024-05-02', '2024-06-25', '2024-08-15', '2024-10-31', '2024-11-01', '2024-12-25', '2024-12-26'
];

const isHoliday = (date: Date) => holidays.includes(format(date, 'yyyy-MM-dd'));

interface WorkingHour {
  datum: string;
  hours: number;
  minutes: number;
  seconds: number;
}

function Calendar() {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [totalWorkedHours, setTotalWorkedHours] = useState<string>("");
  const [totalEarnings, setTotalEarnings] = useState<string>("");
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
  }, [API_URL]); // Added API_URL to dependency array

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
          selectable={false} // Disable selecting days to add events
          editable={false} // Disable editing events
          locales={allLocales}
          locale="en" // Change to English
          firstDay={1} // Set the first day of the week to Monday
          eventsSet={handleEvents}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          dayCellContent={(day) => {
            const workingDay = workingHours.find((wh) => format(new Date(wh.datum), 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd'));
            return workingDay ? `${day.dayNumberText} (${workingDay.hours}h ${workingDay.minutes}m)` : day.dayNumberText;
          }}
          dayCellClassNames={(date) => {
            const day = date.date.getDay();
            return isHoliday(date.date) ? 'holiday' : day === 0 ? 'sunday' : day === 6 ? 'saturday' : '';
          }}
        />
      </div>
      </div>
    </div>
  );
}

export default Calendar;
