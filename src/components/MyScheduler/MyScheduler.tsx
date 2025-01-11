// src/components/MyScheduler.tsx

import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import CalendarEventComponent from './CalenderEventComponent';
import { Event } from './types';
import './index.css';

import { enUS } from 'date-fns/locale/en-US';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface MySchedulerProps {
  allCourses: Course[];
  events: Event[];
  courses: Course[];
  onDragStart: (
    courseId: string,
    eventId?: string,
    eventType?: 'lecture' | 'lab' | 'tutorial' | 'remote' | 'placeholder',
  ) => void;
  onDragEnd: () => void;
  draggingCourseId: string | null;
  draggingEventId: string | null;
  draggingEventType:
    | 'lecture'
    | 'lab'
    | 'tutorial'
    | 'remote'
    | 'placeholder'
    | null;
  onPlaceholderHover: (offeringId: string | null) => void;
  hoveredOfferingId: string | null;
  onScheduleInPersonCourse: (courseId: string, offeringId: string) => void;
  onSwitchLab: (
    courseId: string,
    offeringId: string,
    labSessionId: string,
  ) => void;
  onSwitchTutorial: (
    courseId: string,
    offeringId: string,
    tutorialSessionId: string,
  ) => void;
  onUnscheduleCourse: (courseId: string) => void;
}

const MyScheduler: React.FC<MySchedulerProps> = ({
  allCourses,
  events,
  onDragStart,
  onDragEnd,
  draggingCourseId,
  draggingEventId,
  draggingEventType,
  onPlaceholderHover,
  hoveredOfferingId,
  onScheduleInPersonCourse,
  onSwitchLab,
  onSwitchTutorial,
  onUnscheduleCourse,
}) => {
  const today = new Date(2024, 0, 1);

  const getDateForDay = (dayOfWeek: number, time: Date): Date => {
    const currentDay = today.getDay();
    const diff = (dayOfWeek + 7 - currentDay) % 7;
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
    date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return date;
  };

  // Generate placeholder events when dragging

  const placeholderEvents: Event[] = [];
  if (draggingCourseId) {
    const course = allCourses.find(c => c.id === draggingCourseId);
    if (!course) return [];

    if (draggingEventType === 'lab') {
      // Dragging a lab event to switch lab sessions within the same offering
      const currentEvent = events.find(e => e.id === draggingEventId);
      const offeringId = currentEvent?.offeringId;
      const offering = course?.availableOfferings.find(
        o => o.id === offeringId,
      );

      offering?.labs?.forEach(lab => {
        if (currentEvent?.labSessionId === lab.id) return []; // Skip current lab

        const start = getDateForDay(lab.day, lab.startTime);
        const end = getDateForDay(lab.day, lab.endTime);

        placeholderEvents.push({
          id: `placeholder-lab-${offeringId}-${lab.id}`,
          title: `${course!.name} Lab`,
          section: lab.section,
          start,
          end,
          courseId: course!.id,
          isPlaceholder: true,
          offeringId,
          labSessionId: lab.id,
          eventType: 'placeholder',
        } as Event);
      });
    } else if (draggingEventType === 'tutorial') {
      // Dragging a tutorial event to switch tutorial sessions within the same offering
      const currentEvent = events.find(e => e.id === draggingEventId);
      const offeringId = currentEvent?.offeringId;
      const offering = course?.availableOfferings.find(
        o => o.id === offeringId,
      );

      offering?.tutorials?.forEach(tutorial => {
        if (currentEvent?.tutorialSessionId === tutorial.id) return []; // Skip current tutorial

        const start = getDateForDay(tutorial.day, tutorial.startTime);
        const end = getDateForDay(tutorial.day, tutorial.endTime);

        placeholderEvents.push({
          id: `placeholder-tutorial-${offeringId}-${tutorial.id}`,
          title: `${course!.name} Tutorial`,
          section: tutorial.section,
          start,
          end,
          courseId: course!.id,
          isPlaceholder: true,
          offeringId,
          tutorialSessionId: tutorial.id,
          eventType: 'placeholder',
        } as Event);
      });
    } else {
      // Dragging a course or lecture event to switch offerings
      course?.availableOfferings.forEach(offering => {
        // Exclude current offering
        const currentOfferingId = events
          .filter(e => e.eventType !== 'remote')
          .find(e => e.courseId === draggingCourseId)?.offeringId;
        if (currentOfferingId === offering.id) return [];

        // Create placeholders for lectures
        offering.lectures.forEach(lecture => {
          const start = getDateForDay(lecture.day, lecture.startTime);
          const end = getDateForDay(lecture.day, lecture.endTime);

          placeholderEvents.push({
            id: `placeholder-${offering.id}-${lecture.id}`,
            title: `${course.name}`,
            section: offering.specificData.info.section,
            start,
            end,
            courseId: course!.id,
            isPlaceholder: true,
            offeringId: offering.id,
            eventType: 'placeholder',
          } as Event);
        });
      });
    }
  }

  const allEvents = [...events, ...placeholderEvents];
  const calendarEvents = allEvents.filter(
    event => event.eventType !== 'remote',
  );

  return (
    <div className="flex h-full flex-grow overflow-auto scrollbar">
      <div className="flex-1 flex-grow h-full">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          defaultView="work_week"
          views={['work_week']}
          step={60}
          date={today}
          timeslots={1}
          min={new Date(1970, 1, 1, 7, 0, 0)} // 8 AM
          max={new Date(1970, 1, 1, 19, 0, 0)} // 6 PM
          style={{ height: '100%', width: '100%' }}
          components={{
            toolbar: () => <></>,
            event: props => (
              <CalendarEventComponent
                {...props}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onPlaceholderHover={onPlaceholderHover}
                hoveredOfferingId={hoveredOfferingId}
                onScheduleInPersonCourse={onScheduleInPersonCourse}
                onSwitchLab={onSwitchLab}
                onSwitchTutorial={onSwitchTutorial}
                onUnscheduleCourse={onUnscheduleCourse}
              />
            ),
          }}
        />
      </div>
    </div>
  );
};

export default MyScheduler;
