import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { format } from "date-fns";
import axios from "axios";
import authHeader from "../services/auth-header";

interface Absence {
  userId: string;
  ime: string;
  priimek: string;
  vacations: Vacation[];
  year: number;
}

interface Vacation {
  startDate: string;
  endDate: string;
  reason: string;
}

const holidays = [
  "2024-01-01",
  "2024-02-08",
  "2024-04-21",
  "2024-04-22",
  "2024-05-01",
  "2024-05-02",
  "2024-06-25",
  "2024-08-15",
  "2024-10-31",
  "2024-11-01",
  "2024-12-25",
  "2024-12-26"
];

const isHoliday = (date: Date) => holidays.includes(format(date, "yyyy-MM-dd"));

function AllUsersCalendar() {
  const [absences, setAbsences] = useState<Absence[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/absence/all", { headers: authHeader() })
      .then((response) => {
        setAbsences(response.data);
      })
      .catch((error) => {
        console.error("Error fetching absences:", error);
      });
  }, []);

  const handleEvents = (events: any[]) => {
    // Placeholder for event handling if needed
  };

  return (
    <div className="demo-app">
      <div className="demo-app-main">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={false}
          editable={false}
          locales={allLocales}
          locale="en"
          firstDay={1}
          eventsSet={handleEvents}
          dayCellContent={(day) => {
            const dateStr = format(day.date, "yyyy-MM-dd");
            const eventsForDay = absences
              .flatMap((absence) =>
                absence.vacations.map((vacation) => ({
                  ...vacation,
                  ime: absence.ime,
                  priimek: absence.priimek
                }))
              )
              .filter(
                (vacation) =>
                  dateStr >= format(new Date(vacation.startDate), "yyyy-MM-dd") &&
                  dateStr <= format(new Date(vacation.endDate), "yyyy-MM-dd")
              );
            const holiday = isHoliday(day.date);
            return (
              <div>
                {day.dayNumberText}
                {eventsForDay.map((event, index) => (
                  <div key={index} className="vacation-event">
                    <strong>{event.ime} {event.priimek}:</strong> <span className="vacation-reason">{event.reason}</span>
                  </div>
                ))}
                {holiday && <div className="holiday-label">Holiday</div>}
              </div>
            );
          }}
          dayCellClassNames={(date) => {
            const day = date.date.getDay();
            const dateStr = format(date.date, "yyyy-MM-dd");
            const isVacation = absences.some(absence =>
              absence.vacations.some(vacation =>
                dateStr >= format(new Date(vacation.startDate), "yyyy-MM-dd") &&
                dateStr <= format(new Date(vacation.endDate), "yyyy-MM-dd")
              )
            );
            return isHoliday(date.date)
              ? "holiday"
              : day === 0
              ? "sunday"
              : day === 6
              ? "saturday"
              : isVacation
              ? "vacation-day"
              : "";
          }}
        />
      </div>
    </div>
  );
}

export default AllUsersCalendar;
