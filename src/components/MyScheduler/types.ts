// src/types.ts

import { Event as BigCalendarEvent } from 'react-big-calendar';
import { CourseSection } from '../../containers/NewSchedulePage/fetch-course-data';

export interface LectureTime {
  id: string;
  day: number; // 0 (Sunday) to 6 (Saturday)
  startTime: Date; // Only time is relevant
  endTime: Date;
}

export interface LabSession {
  id: string;
  day: number;
  startTime: Date;
  endTime: Date;
}

export interface TutorialSession {
  id: string;
  day: number;
  startTime: Date;
  endTime: Date;
}

export interface Offering {
  className?: string,
  id: string;
  lectures: LectureTime[];
  labs?: LabSession[]; // Optional labs
  tutorials?: TutorialSession[];
  specificData: CourseSection;
}

export interface Course {
  id: string;
  className?: string;
  name: string;
  availableOfferings: Offering[];
}

export interface Event extends BigCalendarEvent {
  className?: string;
  id: string;
  title: string;
  start: Date;
  end: Date;
  courseId: string;
  isPlaceholder?: boolean;
  offeringId?: string;
  labSessionId?: string;
  tutorialSessionId?: string;
  eventType: 'lecture' | 'lab' | 'tutorial' | 'placeholder';
}
