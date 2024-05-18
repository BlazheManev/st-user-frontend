import React, { useCallback, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { EventApi, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { format } from 'date-fns';
import { INITIAL_EVENTS, createEventId } from "../types/event-utils";

const holidays = [
  '2024-01-01', '2024-02-08', '2024-04-21', '2024-04-22', '2024-05-01', '2024-05-02', '2024-06-25', '2024-08-15', '2024-10-31', '2024-11-01', '2024-12-25', '2024-12-26'
];

const isHoliday = (date: Date) => holidays.includes(format(date, 'yyyy-MM-dd'));

function Calendar() {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);

  const handleEvents = useCallback(
    (events: EventApi[]) => setCurrentEvents(events),
    []
  );

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    let title = prompt("Please enter a title for the event")?.trim();
    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      });
    }
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    if (window.confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'?`)) {
      clickInfo.event.remove();
    }
  }, []);

  return (
    <div className="demo-app">
      <div className="demo-app-main">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          editable={true}
          initialEvents={INITIAL_EVENTS}
          locales={allLocales}
          locale="en" // Change to English
          firstDay={1} // Set the first day of the week to Monday
          eventsSet={handleEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
          dayCellClassNames={(date) => {
            const day = date.date.getDay();
            return isHoliday(date.date) ? 'holiday' : day === 0 ? 'sunday' : day === 6 ? 'saturday' : '';
          }}
        />
      </div>
    </div>
  );
}

export default Calendar;
