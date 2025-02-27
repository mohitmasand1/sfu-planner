// src/components/CalendarEventComponent.tsx

import React, { useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Event as CalendarEvent } from './types';

interface CalendarEventProps {
  event: CalendarEvent;
  title: string;
  // onCourseDrop: (courseId: string, offeringId: string) => void;
  // onLabDrop: (
  //   courseId: string,
  //   offeringId: string,
  //   labSessionId: string,
  // ) => void;
  // onTutorialDrop: (
  //   courseId: string,
  //   offeringId: string,
  //   tutorialSessionId: string,
  // ) => void;
  onDragStart: (
    courseId: string,
    eventId?: string,
    eventType?: 'lecture' | 'lab' | 'tutorial' | 'remote' | 'placeholder',
  ) => void;
  onDragEnd: () => void;
  onPlaceholderHover: (offeringId: string | null) => void;
  hoveredOfferingId: string | null;
  // onRemoveRemoteCourse: (courseId: string) => void;
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

const CalendarEventComponent: React.FC<CalendarEventProps> = ({
  event,
  title,
  // onCourseDrop,
  // onLabDrop,
  // onTutorialDrop,
  onDragStart,
  onDragEnd,
  onPlaceholderHover,
  hoveredOfferingId,
  // onRemoveRemoteCourse,
  onScheduleInPersonCourse,
  onSwitchLab,
  onSwitchTutorial,
  onUnscheduleCourse,
}) => {
  if (event.isPlaceholder) {
    const [{ isOver }, drop] = useDrop<
      {
        offeringId?: string;
        courseId: string;
        eventId?: string;
        eventType?: 'lecture' | 'lab' | 'tutorial' | 'remote' | 'placeholder';
        type: string;
      },
      void,
      { isOver: boolean }
    >({
      accept: ['COURSE', 'SCHEDULED_COURSE', 'SCHEDULED_REMOTE_COURSE'],
      canDrop: item => {
        // console.log('canDrop called with item:', item, 'event:', event);
        if (!item) return false;

        if (event.labSessionId) {
          // Lab placeholder
          return (
            item.eventType === 'lab' &&
            item.courseId === event.courseId &&
            item.offeringId === event.offeringId
          );
        } else if (event.tutorialSessionId) {
          // Tutorial placeholder
          return (
            item.eventType === 'tutorial' &&
            item.courseId === event.courseId &&
            item.offeringId === event.offeringId
          );
        } else {
          // Lecture placeholder
          return (
            (item.eventType === 'lecture' || item.eventType === undefined) &&
            item.courseId === event.courseId
          );
        }
      },
      drop: item => {
        if (item.type === 'SCHEDULED_REMOTE_COURSE') {
          // console.log('dropped remote course to calender');
          onUnscheduleCourse(item.courseId);
        }
        if (event.labSessionId) {
          // Lab placeholder
          onSwitchLab(item.courseId, event.offeringId!, event.labSessionId!);
        } else if (event.tutorialSessionId) {
          // Tutorial placeholder
          onSwitchTutorial(
            item.courseId,
            event.offeringId!,
            event.tutorialSessionId!,
          );
        } else {
          // Lecture placeholder
          onScheduleInPersonCourse(item.courseId, event.offeringId!);
        }
      },
      collect: monitor => ({
        isOver: !!monitor.isOver() && monitor.canDrop(),
      }),
      hover: () => {
        if (!event.labSessionId && !event.tutorialSessionId) {
          onPlaceholderHover(event?.offeringId!);
        }
      },
    });

    let isHighlighted = false;

    if (
      event.eventType === 'placeholder' &&
      !event.labSessionId &&
      !event.tutorialSessionId
    ) {
      // Lecture placeholder
      isHighlighted = hoveredOfferingId === event.offeringId;
    } else if (event.eventType === 'placeholder' && event.labSessionId) {
      // Lab placeholder
      isHighlighted = isOver;
    } else if (event.eventType === 'placeholder' && event.tutorialSessionId) {
      // Tutorial placeholder
      isHighlighted = isOver;
    }

    return (
      <div
        ref={drop}
        className={`flex flex-col justify-center h-full w-full border-2 border-dashed ${
          isHighlighted
            ? 'border-green-500 bg-green-100'
            : 'border-gray-400 bg-gray-200'
        }`}
      >
        <label className="text-sm text-center text-gray-700">{title}</label>
        <label className="text-sm text-center text-gray-700">
          {event.section}
        </label>
      </div>
    );
  }

  // Draggable scheduled events
  const [{ isDragging }, drag] = useDrag<
    {
      courseId: string;
      eventId: string;
      eventType: 'lecture' | 'lab' | 'tutorial' | 'remote' | 'placeholder';
      offeringId?: string;
      type: string;
    },
    unknown,
    { isDragging: boolean }
  >({
    type: 'SCHEDULED_COURSE',
    item: {
      courseId: event.courseId,
      eventId: event.id,
      eventType: event.eventType,
      offeringId: event.offeringId,
      type: 'SCHEDULED_COURSE',
    },
    collect: monitor => {
      return { isDragging: monitor.isDragging() };
    },
    end: () => {
      onDragEnd();
    },
  });

  useEffect(() => {
    // console.log('isDragging:', isDragging);
    if (isDragging) {
      // console.log('eventID of drag: ' + event.id);
      onDragStart(event.courseId, event.id, event.eventType);
    }
  }, [isDragging, event.courseId, event.id, event.eventType, onDragStart]);

  // event.eventType === 'lecture' ? 'bg-blue-600' : 'bg-green-600';

  const dragRef = useRef<HTMLDivElement>(null);
  drag(dragRef);

  return (
    <div
      ref={dragRef}
      className={`flex flex-col h-full justify-center items-center border-y-[1px] border-gray-500 border ${event.className} text-black rounded-lg p-1 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <label className="text-sm">{title}</label>
      <label className="text-sm">{event.section}</label>
    </div>
  );
};

export default CalendarEventComponent;
