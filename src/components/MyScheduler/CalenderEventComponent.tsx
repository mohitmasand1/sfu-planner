// src/components/CalendarEventComponent.tsx

import React, { useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Event as CalendarEvent } from './types';

interface CalendarEventProps {
  event: CalendarEvent;
  title: string;
  onCourseDrop: (courseId: string, offeringId: string) => void;
  onLabDrop: (
    courseId: string,
    offeringId: string,
    labSessionId: string,
  ) => void;
  onTutorialDrop: (
    courseId: string,
    offeringId: string,
    tutorialSessionId: string,
  ) => void;
  onDragStart: (
    courseId: string,
    eventId?: string,
    eventType?: 'lecture' | 'lab' | 'tutorial' | 'placeholder',
  ) => void;
  onDragEnd: () => void;
  onPlaceholderHover: (offeringId: string | null) => void;
  hoveredOfferingId: string | null;
}

const CalendarEventComponent: React.FC<CalendarEventProps> = ({
  event,
  title,
  onCourseDrop,
  onLabDrop,
  onTutorialDrop,
  onDragStart,
  onDragEnd,
  onPlaceholderHover,
  hoveredOfferingId,
}) => {
  if (event.isPlaceholder) {
    const [{ isOver }, drop] = useDrop<
      {
        offeringId?: string;
        courseId: string;
        eventId?: string;
        eventType?: 'lecture' | 'lab' | 'tutorial' | 'placeholder';
      },
      void,
      { isOver: boolean }
    >({
      accept: ['COURSE', 'SCHEDULED_COURSE'],
      canDrop: item => {
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
        if (event.labSessionId) {
          // Lab placeholder
          onLabDrop(item.courseId, event.offeringId!, event.labSessionId!);
        } else if (event.tutorialSessionId) {
          // Tutorial placeholder
          onTutorialDrop(
            item.courseId,
            event.offeringId!,
            event.tutorialSessionId!,
          );
        } else {
          // Lecture placeholder
          onCourseDrop(item.courseId, event.offeringId!);
        }
      },
      collect: monitor => ({
        isOver: !!monitor.isOver() && monitor.canDrop(),
      }),
    });

    useEffect(() => {
      if (
        event.eventType === 'placeholder' &&
        !event.labSessionId &&
        !event.tutorialSessionId
      ) {
        // This is a lecture placeholder
        if (isOver) {
          onPlaceholderHover(event.offeringId!);
        }
      }
      // Do not set onPlaceholderHover(null) here
    }, [
      isOver,
      event.offeringId,
      event.eventType,
      event.labSessionId,
      event.tutorialSessionId,
      onPlaceholderHover,
    ]);

    let isHighlighted = false;

    if (event.eventType === 'placeholder' && !event.labSessionId) {
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
        className={`h-full w-full border-2 border-dashed ${
          isHighlighted
            ? 'border-green-500 bg-green-100'
            : 'border-gray-400 bg-gray-200'
        }`}
      >
        <div className="text-center text-gray-700">{title}</div>
      </div>
    );
  }

  // Draggable scheduled events
  const [{ isDragging }, drag] = useDrag<
    {
      courseId: string;
      eventId: string;
      eventType: 'lecture' | 'lab' | 'tutorial' | 'placeholder';
      offeringId?: string;
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
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      onDragEnd();
    },
  });

  useEffect(() => {
    if (isDragging) {
      onDragStart(event.courseId, event.id, event.eventType);
    }
  }, [isDragging, event.courseId, event.id, event.eventType, onDragStart]);

  // event.eventType === 'lecture' ? 'bg-blue-600' : 'bg-green-600';

  return (
    <div
      ref={drag}
      className={`flex flex-col h-full justify-center items-center border-y-[1px] border-gray-500 border-dashed ${event.className} text-black rounded p-1 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {title}
    </div>
  );
};

export default CalendarEventComponent;
