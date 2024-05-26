import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { format, eachDayOfInterval } from "date-fns";
import axios from "axios";
import authHeader from "../services/auth-header";
import CustomModal from "./customModel.component";
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
  status: string; // Add status field to Vacation
}

interface BusinessTrip {
  startDate: string;
  endDate: string;
  destination: string;
}

type CalendarEvent = 
  | (Vacation & { type: 'vacation'; ime: string; priimek: string; absenceId: string })
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

  // Type guard to check if an event is a vacation
  const isVacation = (event: Vacation | BusinessTrip): event is Vacation => {
    return (event as Vacation).status !== undefined;
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const filterEventsForDay = (events: CalendarEvent[], dateStr: string) => {
    return events.filter((event) => {
      if (isVacation(event)) {
        // Exclude weekends from the vacation range
        const vacationDays = eachDayOfInterval({
          start: new Date(event.startDate),
          end: new Date(event.endDate)
        }).filter(date => !isWeekend(date));

        return vacationDays.some(day => format(day, "yyyy-MM-dd") === dateStr);
      }
      return dateStr >= format(new Date(event.startDate), "yyyy-MM-dd") &&
             dateStr <= format(new Date(event.endDate), "yyyy-MM-dd");
    });
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
            const eventsForDay: CalendarEvent[] = filterEventsForDay(absences
              .flatMap((absence) =>
                [
                  ...(absence.vacations || []).filter(vacation => vacation.status === 'approved').map((vacation) => ({
                    ...vacation,
                    type: 'vacation' as const,
                    ime: absence.ime,
                    priimek: absence.priimek,
                    absenceId: absence._id
                  })),
                  ...(absence.businessTrips || []).map((trip) => ({
                    ...trip,
                    type: 'businessTrip' as const,
                    ime: absence.ime,
                    priimek: absence.priimek
                  }))
                ]
              ), dateStr);

            const holiday = isHoliday(day.date);

            return (
              <div>
                {day.dayNumberText}
                {eventsForDay.slice(0, 2).map((event, index) => (
                  <div key={index} className={`event-name ${event.type === 'vacation' ? "vacation-event" : "business-trip-event"}`}>
                    <span>{event.ime} {event.priimek}</span>
                  </div>
                ))}
                {eventsForDay.length > 2 && (
                  <button className="show-more" onClick={() => openModal(eventsForDay)}>Show more</button>
                )}
              </div>
            );
          }}
          dayCellClassNames={(date) => {
            const day = date.date.getDay();
            const dateStr = format(date.date, "yyyy-MM-dd");
            const isVacationOrTrip = filterEventsForDay(absences.flatMap((absence) =>
              [
                ...(absence.vacations || []).filter(vacation => vacation.status === 'approved').map((vacation) => ({
                  ...vacation,
                  type: 'vacation' as const,
                  ime: absence.ime,
                  priimek: absence.priimek,
                  absenceId: absence._id
                })),
                ...(absence.businessTrips || []).map((trip) => ({
                  ...trip,
                  type: 'businessTrip' as const,
                  ime: absence.ime,
                  priimek: absence.priimek
                }))
              ]
            ), dateStr).length > 0;

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
        <button onClick={closeModal} className="btn btn-secondary">Close</button>
      </CustomModal>
    </div>
  );
}

export default AllUsersCalendar;
