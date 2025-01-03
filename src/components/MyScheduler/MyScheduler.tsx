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
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
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
  onRemoveRemoteCourse: (courseId: string) => void;
}

const MyScheduler: React.FC<MySchedulerProps> = ({
  allCourses,
  events,
  setEvents,
  setCourses,
  onDragStart,
  onDragEnd,
  draggingCourseId,
  draggingEventId,
  draggingEventType,
  onPlaceholderHover,
  hoveredOfferingId,
  onRemoveRemoteCourse,
}) => {
  const today = new Date(2024, 0, 1);

  React.useEffect(() => {
    setCourses(() => {
      // Keep only unscheduled courses
      const scheduledCourseIds = events.map(e => e.courseId);
      return allCourses.filter(
        course => !scheduledCourseIds.includes(course.id),
      );
    });
  }, [allCourses, events]);

  const getDateForDay = (dayOfWeek: number, time: Date): Date => {
    const currentDay = today.getDay();
    const diff = (dayOfWeek + 7 - currentDay) % 7;
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
    date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return date;
  };

  const handleCourseDrop = (courseId: string, offeringId: string) => {
    // Remove existing events for this course
    setEvents(prevEvents => prevEvents.filter(e => e.courseId !== courseId));

    // Remove the course from the course list
    setCourses(prevCourses => prevCourses.filter(c => c.id !== courseId));

    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    const offering = course.availableOfferings.find(o => o.id === offeringId);
    if (!offering) return;

    const newEvents: Event[] = [];

    // Schedule lectures
    newEvents.push(
      ...offering.lectures.map(lecture => {
        const start = getDateForDay(lecture.day, lecture.startTime);
        const end = getDateForDay(lecture.day, lecture.endTime);

        return {
          id: `event-${courseId}-${lecture.id}`,
          className: course?.className || '',
          title: `${course!.name} Lecture`,
          section: offering.specificData.info.section,
          start,
          end,
          courseId,
          offeringId,
          eventType: 'lecture' as const,
        } as Event;
      }),
    );

    // Schedule default lab (first one)
    if (offering.labs && offering.labs.length > 0) {
      const lab = offering.labs[0];
      const start = getDateForDay(lab.day, lab.startTime);
      const end = getDateForDay(lab.day, lab.endTime);

      newEvents.push({
        id: `event-${courseId}-lab-${lab.id}`,
        className: course?.className || '',
        title: `${course!.name} Lab`,
        section: lab.section,
        start,
        end,
        courseId,
        offeringId,
        eventType: 'lab' as const,
        labSessionId: lab.id,
      } as Event);
    }
    // Schedule default tutorial (first one)
    if (offering.tutorials && offering.tutorials.length > 0) {
      const tutorial = offering.tutorials[0];
      const start = getDateForDay(tutorial.day, tutorial.startTime);
      const end = getDateForDay(tutorial.day, tutorial.endTime);

      newEvents.push({
        id: `event-${courseId}-tutorial-${tutorial.id}`,
        className: course?.className || '',
        title: `${course.name} Tutorial`,
        section: tutorial.section,
        start,
        end,
        courseId,
        offeringId,
        eventType: 'tutorial',
        tutorialSessionId: tutorial.id,
      } as Event);
    }

    setEvents(prevEvents => [...prevEvents, ...newEvents]);
    onDragEnd();
  };

  const handleLabDrop = (
    courseId: string,
    offeringId: string,
    labSessionId: string,
  ) => {
    // Update lab event
    setEvents(prevEvents => {
      // Remove existing lab for this course and offering
      const filteredEvents = prevEvents.filter(
        e => !(e.courseId === courseId && e.eventType === 'lab'),
      );

      const course = allCourses.find(c => c.id === courseId);
      const offering = course?.availableOfferings.find(
        o => o.id === offeringId,
      );
      if (!offering) return filteredEvents;

      const lab = offering.labs?.find(l => l.id === labSessionId);
      if (!lab) return filteredEvents;

      const start = getDateForDay(lab.day, lab.startTime);
      const end = getDateForDay(lab.day, lab.endTime);

      const newLabEvent: Event = {
        className: course?.className || '',
        id: `event-${courseId}-lab-${lab.id}`,
        title: `${course!.name} Lab`,
        section: lab.section,
        start,
        end,
        courseId,
        offeringId,
        eventType: 'lab',
        labSessionId: lab.id,
      };

      return [...filteredEvents, newLabEvent];
    });

    onDragEnd();
  };

  const handleTutorialDrop = (
    courseId: string,
    offeringId: string,
    tutorialSessionId: string,
  ) => {
    // Update tutorial event
    setEvents(prevEvents => {
      // Remove existing tutorial for this course and offering
      const filteredEvents = prevEvents.filter(
        e => !(e.courseId === courseId && e.eventType === 'tutorial'),
      );

      const course = allCourses.find(c => c.id === courseId);
      const offering = course?.availableOfferings.find(
        o => o.id === offeringId,
      );
      if (!offering) return filteredEvents;

      const tutorial = offering.tutorials?.find(
        t => t.id === tutorialSessionId,
      );
      if (!tutorial) return filteredEvents;

      const start = getDateForDay(tutorial.day, tutorial.startTime);
      const end = getDateForDay(tutorial.day, tutorial.endTime);

      const newTutorialEvent: Event = {
        className: course?.className || '',
        id: `event-${courseId}-tutorial-${tutorial.id}`,
        title: `${course!.name} Tutorial`,
        section: tutorial.section,
        start,
        end,
        courseId,
        offeringId,
        eventType: 'tutorial',
        tutorialSessionId: tutorial.id,
      };

      return [...filteredEvents, newTutorialEvent];
    });

    onDragEnd();
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
    // <DndProvider backend={HTML5Backend}>
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
                onCourseDrop={handleCourseDrop}
                onLabDrop={handleLabDrop}
                onTutorialDrop={handleTutorialDrop}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onPlaceholderHover={onPlaceholderHover}
                hoveredOfferingId={hoveredOfferingId}
                onRemoveRemoteCourse={onRemoveRemoteCourse}
              />
            ),
          }}
        />
      </div>
    </div>
    // </DndProvider>
  );
};

export default MyScheduler;
