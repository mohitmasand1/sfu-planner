import React, { useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Modal } from 'antd';
import type { ModalProps } from 'antd';
import type { Event as CustomEvent } from '../../components/MyScheduler/types';
import { useQueryClient } from '@tanstack/react-query';
import { fetchCourseOfferings } from './http';
import { CourseOffering, modalData, SemesterData } from './types';
import SaveInstancePage from '../SaveInstanceModal/SaveInstancePage';
import LoadingOverlay from '../../components/Loading/LoadingOverlay';
import { parseTermCode } from '../../utils/parseTermCode';
import SearchControls from '../SearchControls/SearchControls';
import SchedulerSection from '../SchedulerSection/SchedulerSection';

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

export interface NewSchedulePageProps {
  setTermCode: React.Dispatch<React.SetStateAction<string>>;
  termCode: string;
  semesters?: SemesterData[];
}

const NewSchedulePage: React.FC<NewSchedulePageProps> = props => {
  const { termCode, setTermCode, semesters } = props;
  const term = parseTermCode(termCode);

  // Create a ref to store the course-to-color mapping
  const courseColorMapRef = useRef<{ [key: string]: string }>({});
  const availableColorsRef = useRef<string[]>([...colors]); // Initially, all colors are available
  const queryClient = useQueryClient();
  const [modal, contextHolder] = Modal.useModal();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<modalData>({
    title: '',
    content: <></>,
  });
  const [loading, setLoading] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courses, setCourses] = useState<Course[]>(allCourses);
  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [scheduledCourses, setScheduledCourses] = useState<
    { course: Course; offering: Offering }[]
  >([]);
  const [scheduledRemoteCourses, setScheduledRemoteCourses] = useState<
    { course: Course; offering: Offering }[]
  >([]);

  useEffect(() => {
    // Map courseId to offeringId
    const courseOfferingMap: { [courseId: string]: string } = {};

    events.forEach(event => {
      if (!courseOfferingMap[event.courseId]) {
        courseOfferingMap[event.courseId] = event.offeringId!;
      }
    });

    // Build scheduledCourses array
    const scheduled = Object.keys(courseOfferingMap)
      .map(courseId => {
        const offeringId = courseOfferingMap[courseId];
        const course = allCourses.find(c => c.id === courseId);
        const offering = course?.availableOfferings.find(
          o => o.id === offeringId,
        );

        if (course && offering) {
          return { course, offering };
        } else {
          return null;
        }
      })
      .filter(item => item !== null) as {
      course: Course;
      offering: Offering;
    }[];

    setScheduledCourses(scheduled);
  }, [events, allCourses]);

  useEffect(() => {
    setCourses(() => {
      // Keep only unscheduled courses
      const scheduledCourseIds = events.map(e => e.courseId);
      return allCourses.filter(
        course => !scheduledCourseIds.includes(course.id),
      );
    });
  }, [allCourses, events]);

  const handleSemesterChange = (value: string) => {
    setTermCode(value);
    setAllCourses([]);
    // Clear events
    setEvents([]);
    // Clear unscheduled courses
    setCourses([]);
    // Clear scheduled courses
    setScheduledCourses([]);
    // Clear scheduled remote courses
    setScheduledRemoteCourses([]);

    // free all colors
    allCourses.forEach(course => {
      const courseKey = course.name;
      const removedColor = courseColorMapRef.current[courseKey];
      if (removedColor) {
        availableColorsRef.current.push(removedColor);
        delete courseColorMapRef.current[courseKey];
      }
    });
  };

  const onClickSearch = async (
    major: string | null | undefined,
    number: string | number | null | undefined,
  ) => {
    setLoading(true);
    const PreviewingCourseData = await queryClient.fetchQuery<
      CourseOffering[],
      Error
    >({
      queryKey: [term.year, term.semester, major, number],
      queryFn: () =>
        fetchCourseOfferings(term.year, term.semester, major, number),
    });
    setLoading(false);
    // console.log(JSON.stringify(PreviewingCourseData));

    // Get the course identifier (you can use course key or any unique identifier)
    const courseKey = PreviewingCourseData[0].specificData.info.name; // Assuming `key` is a unique identifier for the course

    // Check if the course already has a color assigned
    let classColor = courseColorMapRef.current[courseKey];
    if (!classColor) {
      // Assign a new color from the available pool
      if (availableColorsRef.current.length > 0) {
        classColor = availableColorsRef.current.pop() as string; // Take a color from the end of the available list
        courseColorMapRef.current[courseKey] = classColor;
      } else {
        console.error('No available colors left!');
      }
    }

    const courseObj = {
      id: crypto.randomUUID(),
      className: classColor,
      name: PreviewingCourseData[0].specificData.info.name,
      availableOfferings: transformCourseData(PreviewingCourseData),
    } as Course;
    setAllCourses(all => [...all, courseObj]);
    // console.log(courseObj);
  };

  const isAppliedCourseReSelected = (
    major: string | null | undefined,
    number: string | number | null | undefined,
  ) => {
    return !!allCourses.find(
      course =>
        course.name ===
        major?.toUpperCase() + ' ' + number?.toString().toUpperCase(),
    );
  };

  const showModal = (
    event: React.MouseEvent<HTMLSpanElement>,
    title: string,
    content?: React.ReactNode,
    modalProps?: ModalProps,
  ) => {
    event.stopPropagation();
    if (modalContent) {
      setModalContent({ title, content, modalProps });
    } else {
      setModalContent({
        title: 'Default title',
        content: <label>No modal data</label>,
      });
    }
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const transformCourseData = (data: CourseOffering[]) => {
    return data.map(offering => {
      const { specificData } = offering;

      const lectures = offering.lectures.map(lecture => ({
        id: lecture.id,
        day: lecture.day,
        startTime: new Date(lecture.startTime),
        endTime: new Date(lecture.endTime),
      }));

      const labs = offering.labs.map(lab => ({
        id: lab.id,
        day: lab.day,
        startTime: new Date(lab.startTime),
        endTime: new Date(lab.endTime),
        section: lab.section,
      }));

      const tutorials = offering.tutorials.map(tut => ({
        id: tut.id,
        day: tut.day,
        startTime: new Date(tut.startTime),
        endTime: new Date(tut.endTime),
        section: tut.section,
      }));

      return {
        id: offering.associatedClass,
        lectures,
        labs,
        tutorials,
        specificData,
      };
    });
  };

  const handleSaveSchedule = (event: React.MouseEvent<HTMLSpanElement>) => {
    showModal(event, 'Save', <SaveInstancePage />, {
      okText: 'Confirm',
      onOk: () => {
        setIsModalOpen(false);
      },
    });
  };

  const semesterOptions =
    semesters?.map(sem => ({ value: sem.value, label: sem.label })) || [];

  console.log('allCourses - ', allCourses);
  console.log('courses - ', courses);
  console.log('scheduledCourses - ', scheduledCourses);
  console.log('scheduledRemoteCourses - ', scheduledRemoteCourses);
  console.log('events - ', events);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col flex-1 w-full items-center min-h-0 overflow-hidden">
        <SearchControls
          termCode={termCode}
          semesterOptions={semesterOptions}
          onSemesterChange={handleSemesterChange}
          onClickSearch={onClickSearch}
          isAppliedCourseReSelected={isAppliedCourseReSelected}
        />
        <SchedulerSection
          allCourses={allCourses}
          setAllCourses={setAllCourses}
          events={events}
          setEvents={setEvents}
          courses={courses}
          setCourses={setCourses}
          setScheduledCourses={setScheduledCourses}
          setScheduledRemoteCourses={setScheduledRemoteCourses}
          scheduledRemoteCourses={scheduledRemoteCourses}
          scheduledCourses={scheduledCourses}
          handleSaveSchedule={handleSaveSchedule}
          courseColorMapRef={courseColorMapRef}
          availableColorsRef={availableColorsRef}
          modal={modal}
        />
        {contextHolder}
        {loading && <LoadingOverlay />}{' '}
        <Modal
          title={modalContent.title}
          open={isModalOpen}
          // onOk={handleOk}
          onCancel={handleModalCancel}
          closable={false}
          {...modalContent.modalProps}
          className="!w-full top-12"
        >
          {modalContent.content}
        </Modal>
      </div>
    </DndProvider>
  );
};

export default NewSchedulePage;
