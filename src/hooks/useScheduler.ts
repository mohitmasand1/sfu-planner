// src/hooks/useScheduler.ts
import { useState, useCallback, useRef } from 'react';

// For queries
import { useQueryClient } from '@tanstack/react-query';
import { fetchCourseOfferings } from '../containers/NewSchedulePage/http';
import { parseTermCode } from '../utils/parseTermCode';
import { CourseOffering, Event as CustomEvent } from '../containers/NewSchedulePage/types';
import { Event } from '../components/MyScheduler/types'

// [Optional] If you have types in a separate file, import them:
// import type { } from '../types';

interface SavedScheduleItem {
  offering: string;       // e.g., "CS-12345" or some path
  lab?: string;           // e.g., lab session ID
  tutorial?: string;      // e.g., tutorial session ID
}

// The signature of the custom hook
export function useScheduler(termCode: string) {
  const queryClient = useQueryClient();
  const term = parseTermCode(termCode);

  // ---------------------------
  // States
  // ---------------------------
  // The "master" list of courses that have been searched/added
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  // The "unscheduled" courses that appear in the CourseList
  const [courses, setCourses] = useState<Course[]>([]);
  // The big list of events shown in the calendar (lectures, labs, tutorials)
  const [events, setEvents] = useState<Event[]>([]);
  // The in-person scheduled courses (mirrors your existing approach)
  const [scheduledCourses, setScheduledCourses] = useState<
    { course: Course; offering: Offering }[]
  >([]);
  // The remote-scheduled courses
  const [scheduledRemoteCourses, setScheduledRemoteCourses] = useState<
    { course: Course; offering: Offering }[]
  >([]);

  // For color assignment (same logic as in your code)
  const colors = [
    'bg-selection-1',
    'bg-selection-2',
    'bg-selection-3',
    'bg-selection-4',
    'bg-selection-5',
    'bg-selection-6',
    'bg-selection-7',
    'bg-selection-8',
  ];
  const courseColorMapRef = useRef<{ [key: string]: string }>({});
  const availableColorsRef = useRef<string[]>([...colors]);

  // ---------------------------
  // Utility: getDateForDay
  // (copied from MyScheduler for scheduling events)
  // ---------------------------
  const today = new Date(2024, 0, 1);
  const getDateForDay = useCallback((dayOfWeek: number, time: Date): Date => {
    const currentDay = today.getDay();
    const diff = (dayOfWeek + 7 - currentDay) % 7;
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
    date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return date;
  }, [today]);

  // ---------------------------
  // Add or Search a Course
  // (Similar to your onClickSearch, but moved here)
  // ---------------------------
  const addCourse = useCallback(async (major: string, number: string | number | null | undefined) => {
    // 1. Fetch data from server
    const data = await queryClient.fetchQuery<CourseOffering[], Error>({
      queryKey: [term.year, term.semester, major, number],
      queryFn: () => fetchCourseOfferings(term.year, term.semester, major, number),
    });

    // 2. Assign color if needed
    const courseKey = data[0].specificData.info.name;
    let classColor = courseColorMapRef.current[courseKey];
    if (!classColor) {
      if (availableColorsRef.current.length > 0) {
        classColor = availableColorsRef.current.pop() as string;
        courseColorMapRef.current[courseKey] = classColor;
      } else {
        console.error('No available colors left!');
      }
    }

    // 3. Transform data
    const courseObj = {
      id: crypto.randomUUID(),
      className: classColor,
      name: data[0].specificData.info.name,
      availableOfferings: transformCourseData(data),
    } as Course;

    // 4. Update allCourses and courses
    setAllCourses(all => [...all, courseObj]);
    setCourses(prev => [...prev, courseObj]);
  }, [queryClient, term]);

  // Same transform logic as your code
  const transformCourseData = useCallback((data: CourseOffering[]) => {
    return data.map(offering => {
      const { specificData } = offering;
      // Build lectures, labs, tutorials...
      const path = (
        offering.specificData.info.path.split('?')[1] || ''
      ).replace(/\//g, '-');

      return {
        id: offering.associatedClass,
        path,
        lectures: offering.lectures.map(lec => ({
          ...lec, 
          startTime: new Date(lec.startTime),
          endTime: new Date(lec.endTime),
        })),
        labs: offering.labs.map(lab => ({
          ...lab,
          startTime: new Date(lab.startTime),
          endTime: new Date(lab.endTime),
        })),
        tutorials: offering.tutorials.map(tut => ({
          ...tut,
          startTime: new Date(tut.startTime),
          endTime: new Date(tut.endTime),
        })),
        specificData,
      } as Offering;
    });
  }, []);

  // ---------------------------
  // scheduleInPersonCourse
  // (Moves logic from MyScheduler.handleCourseDrop)
  // ---------------------------
  const scheduleInPersonCourse = useCallback(
    (courseId: string, offeringId: string) => {
      // 1. Remove existing events for this course
      setEvents(prev => prev.filter(e => e.courseId !== courseId));

      // 2. Remove the course from the unscheduled list
      setCourses(prev => prev.filter(c => c.id !== courseId));

      // 3. Find the Course/Offering
      const course = allCourses.find(c => c.id === courseId);
      if (!course) return;
      const offering = course.availableOfferings.find(o => o.id === offeringId);
      if (!offering) return;

      // 4. Create new events for lectures
      const newEvents: Event[] = offering.lectures.map(lecture => ({
        id: `event-${courseId}-${lecture.id}`,
        className: course.className || '',
        title: `${course.name} Lecture`,
        section: offering.specificData.info.section,
        start: getDateForDay(lecture.day, lecture.startTime),
        end: getDateForDay(lecture.day, lecture.endTime),
        courseId,
        offeringId,
        eventType: 'lecture',
      } as Event));

      // 5. Also schedule the first lab if present
      if (offering.labs && offering.labs.length > 0) {
        const lab = offering.labs[0];
        newEvents.push({
          id: `event-${courseId}-lab-${lab.id}`,
          className: course.className || '',
          title: `${course.name} Lab`,
          section: lab.section,
          start: getDateForDay(lab.day, lab.startTime),
          end: getDateForDay(lab.day, lab.endTime),
          courseId,
          offeringId,
          eventType: 'lab',
          labSessionId: lab.id,
        } as Event);
      }

      // 6. Also schedule the first tutorial if present
      if (offering.tutorials && offering.tutorials.length > 0) {
        const tut = offering.tutorials[0];
        newEvents.push({
          id: `event-${courseId}-tutorial-${tut.id}`,
          className: course.className || '',
          title: `${course.name} Tutorial`,
          section: tut.section,
          start: getDateForDay(tut.day, tut.startTime),
          end: getDateForDay(tut.day, tut.endTime),
          courseId,
          offeringId,
          eventType: 'tutorial',
          tutorialSessionId: tut.id,
        } as Event);
      }

      // 7. Add them to events
      setEvents(prev => [...prev, ...newEvents]);

      // 8. Update scheduledCourses
      setScheduledCourses(prev => {
        // Remove if already in scheduled
        const filtered = prev.filter(item => item.course.id !== courseId);
        return [...filtered, { course, offering }];
      });
    },
    [allCourses, getDateForDay],
  );

  // ---------------------------
  // switchLab
  // (Moves logic from MyScheduler.handleLabDrop)
  // ---------------------------
  const switchLab = useCallback(
    (courseId: string, offeringId: string, labSessionId: string) => {
      setEvents(prevEvents => {
        // Remove existing lab for this course
        const filtered = prevEvents.filter(
          e => !(e.courseId === courseId && e.eventType === 'lab')
        );

        const course = allCourses.find(c => c.id === courseId);
        if (!course) return filtered;
        const offering = course.availableOfferings.find(o => o.id === offeringId);
        if (!offering) return filtered;
        const lab = offering.labs?.find(l => l.id === labSessionId);
        if (!lab) return filtered;

        const newLabEvent: Event = {
          id: `event-${courseId}-lab-${lab.id}`,
          className: course.className || '',
          title: `${course.name} Lab`,
          section: lab.section,
          start: getDateForDay(lab.day, lab.startTime),
          end: getDateForDay(lab.day, lab.endTime),
          courseId,
          offeringId,
          eventType: 'lab',
          labSessionId: lab.id,
        };

        return [...filtered, newLabEvent];
      });
    },
    [allCourses, getDateForDay],
  );

  // ---------------------------
  // switchTutorial
  // (Moves logic from MyScheduler.handleTutorialDrop)
  // ---------------------------
  const switchTutorial = useCallback(
    (courseId: string, offeringId: string, tutorialSessionId: string) => {
      setEvents(prevEvents => {
        // Remove existing tutorial for this course
        const filtered = prevEvents.filter(
          e => !(e.courseId === courseId && e.eventType === 'tutorial')
        );

        const course = allCourses.find(c => c.id === courseId);
        if (!course) return filtered;
        const offering = course.availableOfferings.find(o => o.id === offeringId);
        if (!offering) return filtered;
        const tut = offering.tutorials?.find(t => t.id === tutorialSessionId);
        if (!tut) return filtered;

        const newTutEvent: Event = {
          id: `event-${courseId}-tutorial-${tut.id}`,
          className: course.className || '',
          title: `${course.name} Tutorial`,
          section: tut.section,
          start: getDateForDay(tut.day, tut.startTime),
          end: getDateForDay(tut.day, tut.endTime),
          courseId,
          offeringId,
          eventType: 'tutorial',
          tutorialSessionId: tut.id,
        };

        return [...filtered, newTutEvent];
      });
    },
    [allCourses, getDateForDay],
  );

  // ---------------------------
  // scheduleRemoteCourse
  // (Moves logic from RemoteOfferingsDropzone.handleRemoteOfferingSelect)
  // ---------------------------
  const scheduleRemoteCourse = useCallback(
    (courseId: string, offeringId: string) => {
      // 1. Unschedule if already scheduled
      unscheduleCourse(courseId);

      // 2. Add new remote event
      const course = allCourses.find(c => c.id === courseId);
      if (!course) return;
      const offering = course.availableOfferings.find(o => o.id === offeringId);
      if (!offering) return;

      const newRemoteEvent: Event = {
        id: `event-${courseId}-remote-${offeringId}`,
        className: course.className || '',
        title: `${course.name} (Remote)`,
        section: offering.specificData.info.section,
        start: new Date(), // arbitrary
        end: new Date(),   // arbitrary
        allDay: true,
        courseId,
        offeringId,
        eventType: 'remote',
      };

      setEvents(prev => [...prev, newRemoteEvent]);

      // 3. Update scheduledRemoteCourses
      setScheduledRemoteCourses(prev => {
        const filtered = prev.filter(item => item.course.id !== courseId);
        return [...filtered, { course, offering }];
      });

      // 4. Also update scheduledCourses to keep a single reference
      setScheduledCourses(prev => {
        const filtered = prev.filter(item => item.course.id !== courseId);
        return [...filtered, { course, offering }];
      });

      // 5. Remove from unscheduled courses
      setCourses(prev => prev.filter(c => c.id !== courseId));
    },
    [allCourses],
  );

  // ---------------------------
  // unscheduleCourse
  // (General logic to remove from events/scheduled)
  // ---------------------------
  const unscheduleCourse = useCallback(
    (courseId: string) => {
      // 1. Remove from events
      setEvents(prev => prev.filter(e => e.courseId !== courseId));
      // 2. Remove from scheduledCourses
      setScheduledCourses(prev => prev.filter(item => item.course.id !== courseId));
      // 3. Remove from scheduledRemoteCourses
      setScheduledRemoteCourses(prev =>
        prev.filter(item => item.course.id !== courseId)
      );
      // 4. Add back to unscheduled courses
      const course = allCourses.find(c => c.id === courseId);
      if (course) {
        setCourses(prev => {
          if (!prev.find(c => c.id === courseId)) {
            return [...prev, course];
          }
          return prev;
        });
      }
    },
    [allCourses],
  );

 // -------------------------------------------------------------------
  // 2) Deleting from the CourseList (“Unscheduled”)
  // -------------------------------------------------------------------
  const handleDeleteCourseFromList = useCallback(
    (courseId: string, courseKey: string) => {
      // Remove the course from unscheduled courses
      setCourses(prevCourses => prevCourses.filter(c => c.id !== courseId));

      // Also remove the course from allCourses
      setAllCourses(prevAllCourses =>
        prevAllCourses.filter(c => c.id !== courseId),
      );

      // Restore the color if used
      const removedColor = courseColorMapRef.current[courseKey];
      if (removedColor) {
        availableColorsRef.current.push(removedColor);
        delete courseColorMapRef.current[courseKey];
      }
    },
    [setCourses, setAllCourses],
  );

  // -------------------------------------------------------------------
  // 3) Deleting from a Scheduled Course
  //    (includes removing events, remote scheduling, etc.)
  // -------------------------------------------------------------------
  const handleScheduledDelete = useCallback(
    (courseKey: string, courseId: string) => () => {
      // Remove the course from allCourses
      setAllCourses(prevAllCourses =>
        prevAllCourses.filter(c => c.id !== courseId),
      );

      // Remove any events associated with the course
      setEvents(prevEvents => prevEvents.filter(e => e.courseId !== courseId));

      // Remove the course from unscheduled courses
      setCourses(prevCourses => prevCourses.filter(c => c.id !== courseId));

      // Remove the course from in-person courses, in case it was remote-scheduled
      setScheduledCourses(prevRemotes =>
        prevRemotes.filter(c => c.course.id !== courseId),
      );

      // Remove the course from remote courses, in case it was remote-scheduled
      setScheduledRemoteCourses(prevRemotes =>
        prevRemotes.filter(c => c.course.id !== courseId),
      );

      // Restore the color to the available pool
      const removedColor = courseColorMapRef.current[courseKey];
      if (removedColor) {
        availableColorsRef.current.push(removedColor);
        delete courseColorMapRef.current[courseKey];
      }

      // TODO
      // message.success('Removed');
    },
    [
      // draggingCourseId,
      // handleDragEnd,
      setAllCourses,
      setEvents,
      setCourses,
      setScheduledRemoteCourses,
    ],
  );

  // ---------------------------
  // loadSchedule
  // (New method to programmatically schedule a saved set of courses)
  // ---------------------------
  // const loadSchedule = useCallback(
  //   async (savedSchedule: SavedScheduleItem[]) => {
  //     // 1. For each saved item, find or fetch the course in allCourses
  //     for (let item of savedSchedule) {
  //       const { offering, lab, tutorial } = item;

  //       // a) Find the course/offering in allCourses
  //       let course = allCourses.find(c =>
  //         c.availableOfferings.some(o => o.path === offering)
  //       );

  //       // b) If not found, fetch from API (if that's your workflow)
  //       if (!course) {
  //         // Example approach: parse major & number from the path or
  //         // do whatever your logic is to fetch the missing course
  //         // ...
  //         // for safety, skip if you can't fetch
  //         console.error(`Course for offering path ${offering} not found and not fetched.`);
  //         continue;
  //       }

  //       // c) Find the correct offering
  //       const courseOffering = course.availableOfferings.find(o => o.path === offering);
  //       if (!courseOffering) {
  //         console.error(`Offering path ${offering} not found in course ${course.name}`);
  //         continue;
  //       }

  //       // d) Check if it's remote
  //       const isRemote = !courseOffering.lectures?.length &&
  //                        !courseOffering.labs?.length &&
  //                        !courseOffering.tutorials?.length;

  //       // e) If remote, schedule via scheduleRemoteCourse
  //       if (isRemote) {
  //         scheduleRemoteCourse(course.id, courseOffering.id);
  //       } else {
  //         // f) In-person => scheduleInPersonCourse
  //         scheduleInPersonCourse(course.id, courseOffering.id);

  //         // g) If the user selected a specific lab, switch it
  //         if (lab) {
  //           switchLab(course.id, courseOffering.id, lab);
  //         }
  //         // h) If the user selected a specific tutorial, switch it
  //         if (tutorial) {
  //           switchTutorial(course.id, courseOffering.id, tutorial);
  //         }
  //       }
  //     }
  //   },
  //   [
  //     allCourses,
  //     scheduleInPersonCourse,
  //     scheduleRemoteCourse,
  //     switchLab,
  //     switchTutorial,
  //   ],
  // );

  // ---------------------------
  // Reset / Clear
  // (Analogous to handleDeleteAllSelections)
  // ---------------------------
  const clearAll = useCallback(() => {
    // Clear states
    setAllCourses([]);
    setCourses([]);
    setEvents([]);
    setScheduledCourses([]);
    setScheduledRemoteCourses([]);
    // Clear color refs
    Object.keys(courseColorMapRef.current).forEach(key => {
      const color = courseColorMapRef.current[key];
      if (color) {
        availableColorsRef.current.push(color);
      }
    });
    courseColorMapRef.current = {};
  }, []);

  // Return everything needed
  return {
    // States
    allCourses,
    courses,
    events,
    scheduledCourses,
    scheduledRemoteCourses,
    // Methods
    addCourse,
    scheduleInPersonCourse,
    scheduleRemoteCourse,
    switchLab,
    switchTutorial,
    unscheduleCourse,
    handleDeleteCourseFromList,
    handleScheduledDelete,
    // loadSchedule,
    clearAll,
    // Refs for color if needed (or hide them behind a function)
    courseColorMapRef,
    availableColorsRef,
  };
}
