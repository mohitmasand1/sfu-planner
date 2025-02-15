// src/hooks/useScheduler.ts
import { useState, useCallback, useRef, useEffect } from 'react';

// For queries
import { useQueryClient } from '@tanstack/react-query';
import { fetchCourseOfferings } from '../containers/NewSchedulePage/http';
import { parseTermCode } from '../utils/parseTermCode';
import { CourseOffering } from '../containers/NewSchedulePage/types';
import { Event } from '../components/MyScheduler/types'

// The signature of the custom hook
export function useScheduler(termCode: string) {
  const queryClient = useQueryClient();
  // const term = parseTermCode(termCode);

  // ---------------------------
  // States
  // ---------------------------
  const [term, setTerm] = useState(parseTermCode(termCode));
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

  useEffect(() => {
    setTerm(parseTermCode(termCode))
  }, [termCode])

  // For color assignment
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
  console.log('TERMCODE IN USESCHEDULER --', termCode)

  // ---------------------------
  // Utility: getDateForDay
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
  // ---------------------------
  const addCourse = async (major: string, number: string | number | null | undefined) => {
    // 1. Fetch data from server
    console.log('MAKING A REQUEST WITH TERM CODE --', termCode)
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

    return courseObj;
  };

  const addCourseByTerm = async (code: string, major: string, number: string | number | null | undefined) => {
    // 1. Fetch data from server
    console.log('MAKING A REQUEST WITH TERM CODE --', termCode)
    const termObj = parseTermCode(code)
    const data = await queryClient.fetchQuery<CourseOffering[], Error>({
      queryKey: [termObj.year, termObj.semester, major, number],
      queryFn: () => fetchCourseOfferings(termObj.year, termObj.semester, major, number),
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

    return courseObj;
  };

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
  // ---------------------------
  const switchLab = useCallback(
    (courseId: string, offeringId: string, labSessionId: string) => {
      setEvents(prevEvents => {
        // Remove existing lab for this course
        const filtered = prevEvents.filter(
          e => !(e.courseId === courseId && e.eventType === 'lab')
        );

        console.log('searching for course to switch lab...')

        const course = allCourses.find(c => c.id === courseId);
        if (!course) return filtered;
        const offering = course.availableOfferings.find(o => o.id === offeringId);
        if (!offering) return filtered;
        console.log('Searching Lab....')
        const lab = offering.labs?.find(l => l.id === labSessionId);
        if (!lab) return filtered;
        console.log('lab being added - ', lab)

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
      setAllCourses,
      setEvents,
      setCourses,
      setScheduledRemoteCourses,
    ],
  );
  
  const scheduleInPersonCourses = useCallback(
    (course: Course, offeringId: string) => {
      // 1. Remove existing events for this course
      console.log("SCHEDULING----")
      setEvents(prev =>
        prev.filter(e => e.courseId !== course.id),
      );
  
      // 2. Remove the course from the unscheduled list
      setCourses(prev =>
        prev.filter(c => c.id !== course.id),
      );
  
      // 3. Find the Offering directly from the passed-in Course
      const offering = course.availableOfferings.find(o => o.id === offeringId);
      if (!offering) return;
  
      // 4. Create new events for lectures
      const newEvents: Event[] = offering.lectures.map(lecture => ({
        id: `event-${course.id}-${lecture.id}`,
        className: course.className || '',
        title: `${course.name} Lecture`,
        section: offering.specificData.info.section,
        start: getDateForDay(lecture.day, lecture.startTime),
        end: getDateForDay(lecture.day, lecture.endTime),
        courseId: course.id,
        offeringId,
        eventType: 'lecture',
      }));

      console.log('Found offering:', offering);
      console.log('Labs for this offering:', offering.labs);
      console.log('Tutorials for this offering:', offering.tutorials);
  
      // 5. Also schedule the first lab if present
      if (offering.labs && offering.labs.length > 0) {
        const lab = offering.labs[0];
        newEvents.push({
          id: `event-${course.id}-lab-${lab.id}`,
          className: course.className || '',
          title: `${course.name} Lab`,
          section: lab.section,
          start: getDateForDay(lab.day, lab.startTime),
          end: getDateForDay(lab.day, lab.endTime),
          courseId: course.id,
          offeringId,
          eventType: 'lab',
          labSessionId: lab.id,
        } as Event);
      }
  
      // 6. Also schedule the first tutorial if present
      if (offering.tutorials && offering.tutorials.length > 0) {
        const tut = offering.tutorials[0];
        newEvents.push({
          id: `event-${course.id}-tutorial-${tut.id}`,
          className: course.className || '',
          title: `${course.name} Tutorial`,
          section: tut.section,
          start: getDateForDay(tut.day, tut.startTime),
          end: getDateForDay(tut.day, tut.endTime),
          courseId: course.id,
          offeringId,
          eventType: 'tutorial',
          tutorialSessionId: tut.id,
        } as Event);
      }
  
      console.log('newEvents being added to events: ', newEvents)
      // 7. Add them to events
      setEvents(prev => [...prev, ...newEvents]);
  
      // 8. Update scheduledCourses
      setScheduledCourses(prev => {
        // Remove if already in scheduled
        const filtered = prev.filter(item => item.course.id !== course.id);
        return [...filtered, { course, offering }];
      });
    },
    [getDateForDay],
  );

  const switchLabs = useCallback(
    (course: Course, offeringId: string, labSessionId: string) => {
      setEvents(prevEvents => {
        // Remove existing lab for this course
        const filtered = prevEvents.filter(
          e => !(e.courseId === course?.id && e.eventType === 'lab')
        );

        console.log('searching for course to switch lab...')

        // const course = allCourses.find(c => c.id === course?.id);
        if (!course) return filtered;
        const offering = course.availableOfferings.find(o => o.id === offeringId);
        if (!offering) return filtered;
        console.log('Searching Lab....')
        const lab = offering.labs?.find(l => l.id === labSessionId);
        if (!lab) return filtered;
        console.log('lab being added - ', lab)

        const newLabEvent: Event = {
          id: `event-${course.id}-lab-${lab.id}`,
          className: course.className || '',
          title: `${course.name} Lab`,
          section: lab.section,
          start: getDateForDay(lab.day, lab.startTime),
          end: getDateForDay(lab.day, lab.endTime),
          courseId: course.id,
          offeringId,
          eventType: 'lab',
          labSessionId: lab.id,
        };

        return [...filtered, newLabEvent];
      });
    },
    [allCourses, getDateForDay],
  );

  const switchTutorials = useCallback(
    (course: Course, offeringId: string, tutorialSessionId: string) => {
      setEvents(prevEvents => {
        const courseId = course?.id
        // Remove existing tutorial for this course
        const filtered = prevEvents.filter(
          e => !(e.courseId === course?.id && e.eventType === 'tutorial')
        );

        // const course = allCourses.find(c => c.id === courseId);
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
  // loadSchedule
  // ---------------------------
  const loadSchedule = 
    async (savedSchedule: OutputSchedule, code: string) => {
      // Loop through each course we want to schedule
      clearAll();

      for (const outputCourse of savedSchedule.course_ids) {
        // 1) Parse the offering string, e.g. "2025-spring-cmpt-120-d200"
        const [major, num, section] = outputCourse.offering.split(' ');
        // major = "cmpt", num = "120", section = "d200"
  
        // 2) Add the course programmatically (simulating user search)
        //    IMPORTANT: addCourse should return a newly created Course or null
        console.log("TERMCODE IN LOADSCHEDULE", termCode)
        const newCourse = await addCourseByTerm(code, major, num);
        console.log(newCourse)
        if (!newCourse) {
          console.error(`Could not add course for: ${major} ${num}`);
          continue;
        }
  
        // 3) Find the correct offering by matching the 'section'
        //    e.g. offering.specificData.info.section === "d200"
        const offering = newCourse.availableOfferings.find(o =>
          o.specificData.info.section?.toLowerCase() === section.toLowerCase()
        );
  
        if (!offering) {
          console.error(
            `No offering found in course "${newCourse.name}" matching section "${section}".`
          );
          continue;
        }  
        // 4) Check if it’s remote or in-person
        const isRemote =
          (offering.lectures?.length ?? 0) === 0 &&
          (offering.labs?.length ?? 0) === 0 &&
          (offering.tutorials?.length ?? 0) === 0;
  
        // 5) Schedule the course
        if (isRemote) {
          // Remote course => scheduleRemoteCourse
          scheduleRemoteCourse(newCourse.id, offering.id);
        } else {
          console.log("scheduling" + newCourse.id)
          // In-person => scheduleInPersonCourse
          scheduleInPersonCourses(newCourse, offering.id);
        }

        const labId = offering.labs?.find(lab => lab.section == outputCourse.lab)?.id || ''
        const tutId = offering.tutorials?.find(tut => tut.section == outputCourse.tutorial)?.id || ''
        console.log('outputCourse LAB - ', labId)
        console.log('outputCourse TUT - ', tutId)
  
        // 6) If the user selected particular labs/tutorials, switch them now
        //    For example, just use the first lab/tutorial in the arrays:
        if (!isRemote) {
          // Switch lab if present
          if (outputCourse.lab && outputCourse.lab.length > 0) {
            switchLabs(newCourse, offering.id, labId);
          }
          // Switch tutorial if present
          if (outputCourse.tutorial && outputCourse.tutorial.length > 0) {
            switchTutorials(newCourse, offering.id, tutId);
          }
        }
      }
  
      console.log('Finished loading schedule:', savedSchedule.name);
    }

  // ---------------------------
  // Reset / Clear
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
    term,
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
    loadSchedule,
    clearAll,
    // Refs for color
    courseColorMapRef,
    availableColorsRef,
  };
}
