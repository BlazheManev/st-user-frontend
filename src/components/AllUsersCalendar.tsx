import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { format } from "date-fns";
import axios from "axios";
import authHeader from "../services/auth-header";
import CustomModal from "./customModel.component";
import '../styles/CustomModal.css';

interface Absence {
  userId: string;
  ime: string;
  priimek: string;
  vacations: Vacation[];
  businessTrips: BusinessTrip[];
  year: number;
}

interface Vacation {
  startDate: string;
  endDate: string;
  reason: string;
}

interface BusinessTrip {
  startDate: string;
  endDate: string;
  destination: string;
}

type CalendarEvent = 
  | (Vacation & { type: 'vacation'; ime: string; priimek: string })
  | (BusinessTrip & { type: 'businessTrip'; ime: string; priimek: string });

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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<CalendarEvent[]>([]);

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

  const openModal = (events: CalendarEvent[]) => {
    setModalContent(events);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalContent([]);
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
            const eventsForDay: CalendarEvent[] = absences
              .flatMap((absence) =>
                [
                  ...(absence.vacations || []).map((vacation) => ({
                    ...vacation,
                    type: 'vacation' as const,
                    ime: absence.ime,
                    priimek: absence.priimek
                  })),
                  ...(absence.businessTrips || []).map((trip) => ({
                    ...trip,
                    type: 'businessTrip' as const,
                    ime: absence.ime,
                    priimek: absence.priimek
                  }))
                ]
              )
              .filter(
                (event) =>
                  dateStr >= format(new Date(event.startDate), "yyyy-MM-dd") &&
                  dateStr <= format(new Date(event.endDate), "yyyy-MM-dd")
              );
            const holiday = isHoliday(day.date);

            return (
              <div>
                {day.dayNumberText}
                {eventsForDay.slice(0, 2).map((event, index) => (
                  <div key={index} className={event.type === 'vacation' ? "vacation-event" : "business-trip-event"}>
                    <span>{event.ime} {event.priimek}</span>
                  </div>
                ))}
                {eventsForDay.length > 2 && (
                  <button className="show-more" onClick={() => openModal(eventsForDay)}>Show more</button>
                )}
                {holiday && <div className="holiday-label">Holiday</div>}
              </div>
            );
          }}
          dayCellClassNames={(date) => {
            const day = date.date.getDay();
            const dateStr = format(date.date, "yyyy-MM-dd");
            const isVacationOrTrip = absences.some(absence =>
              [...(absence.vacations || []), ...(absence.businessTrips || [])].some(event =>
                dateStr >= format(new Date(event.startDate), "yyyy-MM-dd") &&
                dateStr <= format(new Date(event.endDate), "yyyy-MM-dd")
              )
            );
            return isHoliday(date.date)
              ? "holiday"
              : day === 0
              ? "sunday"
              : day === 6
              ? "saturday"
              : isVacationOrTrip
              ? "vacation-day"
              : "";
          }}
        />
      </div>
      <CustomModal isOpen={modalIsOpen} onClose={closeModal}>
        <h2>Vacation Details</h2>
        {modalContent.map((event, index) => (
          <div key={index} className={event.type === 'vacation' ? "vacation-event" : "business-trip-event"}>
            <strong>{event.ime} {event.priimek}:</strong> 
            <span className={event.type === 'vacation' ? "vacation-reason" : "business-trip-destination"}>
              {event.type === 'vacation' ? `Vacation: ${event.reason}` : `Business Trip: ${event.destination}`}
            </span>
          </div>
        ))}
        <button onClick={closeModal}>Close</button>
      </CustomModal>
    </div>
  );
}

export default AllUsersCalendar;
