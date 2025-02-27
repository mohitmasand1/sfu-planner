import { Event as BigCalendarEvent } from 'react-big-calendar';

export interface TutorialSession {
  id: string;
  day: number;
  startTime: Date;
  endTime: Date;
  section: string;
}

export interface Event extends BigCalendarEvent {
  className?: string;
  id: string;
  title: string;
  section: string;
  start: Date;
  end: Date;
  courseId: string;
  isPlaceholder?: boolean;
  offeringId?: string;
  labSessionId?: string;
  tutorialSessionId?: string;
  eventType: 'lecture' | 'lab' | 'tutorial' | 'placeholder' | 'remote';
}
